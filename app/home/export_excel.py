import xlsxwriter
import os
import json
from app.mbuilder import utils


def reset_columns(worksheet):
    global stack
    stack = []
    global stack2
    stack2 = []
    global row
    row = 1
    global prev_active
    prev_active = []
    for i in range(40):
        if i % 2:
            prev_active.append(None)
            worksheet.set_column(i, i, 30)
        else:
            worksheet.set_column(i, i, 10)


def export_menu_run(path):
    data = utils.read_data()
    print('Path: {}'.format(path))
    if os.path.exists(path):
        os.remove(path)
    workbook = xlsxwriter.Workbook(path)
    default_fmt = workbook.add_format()
    default_fmt.set_text_wrap()
    default_fmt.set_align('top')
    default_fmt.set_border()
    default_fmt.set_border_color('#002060')
    act_fmt = workbook.add_format()
    act_fmt.set_text_wrap()
    act_fmt.set_align('top')
    act_fmt.set_bold()
    lbl_fmt = workbook.add_format()
    lbl_fmt.set_bold()
    lbl_fmt.set_pattern(1)
    lbl_fmt.set_bg_color('#002060')
    lbl_fmt.set_font_color('#B6FF15')
    ttchars_fmt = workbook.add_format()
    ttchars_fmt.set_border()
    ttchars_fmt.set_border_color('#002060')
    fmt = {
        'active': act_fmt,
        'label': lbl_fmt,
        'ttchars': ttchars_fmt,
        'default': default_fmt
    }

    ROOT = json.loads(data)

    worksheet_en = workbook.add_worksheet('English')
    reset_columns(worksheet_en)
    render_menu('eng', worksheet_en, ROOT, fmt)

    worksheet_sw = workbook.add_worksheet('Swahili')
    reset_columns(worksheet_sw)
    render_menu('swa', worksheet_sw, ROOT, fmt)
    workbook.close()


stack = []
stack2 = []

row = 1
prev_active = []


def cell(row, col):
    return '{}{}'.format(chr(ord('A') + col), row + 1)


def render_menu(lang, worksheet, menu, fmt):
    global row
    global prev_active
    m_size = len(menu['menus'])
    for m in menu['menus']:
        r = present_menu(lang, worksheet, menu)
        stack.append(r)
        stack2.append(m.get(lang, m['name']))
        render_menu(lang, worksheet, m, fmt)
    if not m_size:
        max_rows = 0
        for i, it in enumerate(stack):
            if prev_active[i] and prev_active[i] == stack2[i]:
                continue
            if not len(it):
                continue
            if len(it) > 1:
                m_first = it[1]
                splt = m_first.split(':::')
                m_first = splt[1]
                m_fm_order = splt[0]
                if stack2[i] == m_first and m_fm_order == '0':
                    row = row - 4  # Offset incremented row
                    continue
            max_rows = max(max_rows, len(it))
            render_cell(worksheet, it, i, fmt)
            prev_active[i] = stack2[i]
        row = row + 4
    if len(stack) > 0:
        stack.pop()
    if len(stack2) > 0:
        stack2.pop()


def render_cell(worksheet, it, i, fmt):
    m_label_split = it[0].split(':::')
    m_label = m_label_split[0]
    m_type = m_label_split[1]
    worksheet.write(row + 0, 1 + i * 2, m_label, fmt['label'])
    it.pop(0)

    m_list1 = []
    m_list2 = []
    m_next = False
    m_active = ''

    for j, m in enumerate(it):
        m_parts = m.split(':::')
        m = m_parts[1]
        order_no = int(m_parts[0])
        if stack2[i] == m:
            m_next = True
            m_active = m
            if j == 0:
                m_active = '{}. {}\n'.format(order_no, m_active)
            else:
                m_active = '\n{}. {}\n'.format(order_no, m_active)
            continue
        if m_next:
            m_list2.append('{}. {}'.format(order_no, m))
        else:
            if order_no:
                m_list1.append('{}. {}'.format(order_no, m))
            else:
                m_list1.append('{}'.format(m))

    m_text1 = '{}'.format('\n'.join(m_list1))
    m_active_text = '\n{}'.format(m_active)
    m_text2 = '{}\n'.format('\n'.join(m_list2))
    ret = ''

    if m_type in ['SMS', 'TEXT', 'MESSAGE']:
        tmp = []
        for it1 in it:
            tmp.append(it1.split(':::')[1])
        ret = worksheet.write(
            row + 1, 1 + i * 2, '{}\n'.format('\n'.join(tmp)), fmt['default'])
    elif m_text1 == '':
        ret = worksheet.write_rich_string(
            row + 1, 1 + i * 2, m_active, fmt['default'], '{}'.format(m_text2),  fmt['active'], '\n', fmt['default'])
    else:
        ret = worksheet.write_rich_string(row + 1, 1 + i * 2, '{}'.format(
            m_text1), fmt['active'], m_active, fmt['default'], '{}'.format(m_text2),  fmt['default'])
    if ret < 0:
        print('Label: {}, Status: {}, Type: {}, MText1: {}, Active: {},  mText2: {}'.format(
            m_label, ret, m_type, m_text1, m_active, m_text2))
    worksheet.write_formula(
        row + 2, 1 + i * 2, '=LEN({})'.format(cell(row + 1, 1 + i * 2)), fmt['ttchars'])    # OK


def present_menu(lang, worksheet, menu):
    menu_repr = ['{}:::{}'.format(menu['name'], menu.get('type', 'OPTIONS'))]
    for m in menu['menus']:
        menu_repr.append('{}:::{}'.format(
            m['orderNo'], m.get(lang, m['name'])))
    return menu_repr
