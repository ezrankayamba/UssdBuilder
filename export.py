import os
import json
import xlsxwriter
data_file = 'data.json'


def export_menu():
    try:
        with open(data_file, 'r') as file:
            data = file.read()
            file.close()
    except IOError:
        data = "{}"
        with open(data_file, 'w') as file:
            file.write(data)
            file.close()

    dirpath = os.getcwd()
    path = os.path.join(dirpath, "export.xlsx")
    print('Path: {}'.format(path))
    if os.path.exists(path):
        os.remove(path)
    workbook = xlsxwriter.Workbook(path)
    act_fmt = workbook.add_format()
    act_fmt.set_bold()
    lbl_fmt = workbook.add_format()
    lbl_fmt.set_bold()
    lbl_fmt.set_pattern(1)
    lbl_fmt.set_bg_color('#002060')
    lbl_fmt.set_font_color('#B6FF15')
    ttchars_fmt = workbook.add_format()
    ttchars_fmt.set_border()
    ttchars_fmt.set_border_color('#333333')
    fmt = {
        'active': act_fmt,
        'label': lbl_fmt,
        'ttchars': ttchars_fmt
    }

    worksheet = workbook.add_worksheet()
    ROOT = json.loads(data)
    render_menu(worksheet, ROOT, fmt)
    workbook.close()


stack = []
stack2 = []

row = 1
prev_active = []
for i in range(20):
    prev_active.append(None)


def render_menu(worksheet, menu, fmt):
    global row
    global prev_active
    m_size = len(menu['menus'])
    for m in menu['menus']:
        r = present_menu(worksheet, menu)
        stack.append(r)
        stack2.append(m['name'])
        render_menu(worksheet, m, fmt)
    if not m_size:
        max_rows = 0
        for i, it in enumerate(stack):
            total_chars = 0
            for j, m in enumerate(it):
                if prev_active[i] and prev_active[i] == stack2[i]:
                    print('Duplicate')
                    total_chars = 0
                    break
                max_rows = max(max_rows, len(it))
                total_chars = total_chars + len(m)
                if j == 0:
                    worksheet.write(row + j, 1 + i * 2, m, fmt['label'])
                elif stack2[i] == m:
                    worksheet.write(
                        row + j, 1 + i * 2, '{}. {}'.format(j, m), fmt['active'])
                    total_chars = total_chars + 3
                else:
                    worksheet.write(row + j, 1 + i * 2, '{}. {}'.format(j, m))
                    total_chars = total_chars + 3
                if j == len(it) - 1:
                    worksheet.write_number(row + max_rows, 1 + i * 2,
                                           total_chars, fmt['ttchars'])

            prev_active[i] = stack2[i]
            print('{} - {}'.format(prev_active[i], stack2[i]))
        row = row + max_rows + 3
    if len(stack) > 0:
        stack.pop()
    if len(stack2) > 0:
        stack2.pop()


def present_menu(worksheet, menu):
    menu_repr = [menu['name']]
    for m in menu['menus']:
        menu_repr.append(m['name'])
    return menu_repr


export_menu()
