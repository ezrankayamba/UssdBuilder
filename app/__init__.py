from flask import render_template, request, send_file
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import xlsxwriter
import requests
import xmltodict
from datetime import datetime
import os
import json
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../../ussd.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class APIAudit(db.Model):
    __tablename__ = 'tbl_api_audit'
    id = db.Column(db.Integer, primary_key=True)
    request = db.Column(db.String(1000))
    response = db.Column(db.String(1000))
    ip_address = db.Column(db.String(50))
    created_on = db.Column(db.DateTime, server_default=db.func.now())
    updated_on = db.Column(
        db.DateTime, server_default=db.func.now(), server_onupdate=db.func.now())
    result = db.Column(db.String(10))
    service_name = db.Column(db.String(50))
    user_name = db.Column(db.String(50))
    ref_number = db.Column(db.String(255))
    message = db.Column(db.String(1000))

    def __repr__(self):
        return '<APIAudit %r>' % self.id


data_file = 'data.json'


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/get_menu', methods=['GET'])
def get_menu():
    try:
        with open(data_file, 'r') as file:
            data = file.read()
            file.close()
    except IOError:
        data = "{}"
        with open(data_file, 'w') as file:
            file.write(data)
            file.close()
    return data


menu_head_format = None


@app.route('/export_menu', methods=['GET'])
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
    export_menu_run(path)
    return send_file(path, as_attachment=True)


@app.route('/update_menu', methods=['POST'])
def update_menu():
    data = request.data.decode('utf-8')
    # print(data)
    if not data:
        data = "{}"
    with open(data_file, 'w') as file:
        file.write(data)
        file.close()
    return json.dumps({'success': True})


def export_menu_run(path):
    try:
        with open(data_file, 'r') as file:
            data = file.read()
            file.close()
    except IOError:
        data = "{}"
        with open(data_file, 'w') as file:
            file.write(data)
            file.close()
    print('Path: {}'.format(path))
    if os.path.exists(path):
        os.remove(path)
    workbook = xlsxwriter.Workbook(path)
    default_fmt = workbook.add_format()
    default_fmt.set_text_wrap()
    default_fmt.set_align('top')
    act_fmt = workbook.add_format()
    act_fmt.set_text_wrap()
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
        'ttchars': ttchars_fmt,
        'default': default_fmt
    }

    ROOT = json.loads(data)
    worksheet_en = workbook.add_worksheet('English')
    worksheet_en.set_column(0, 20, 30)
    worksheet_sw = workbook.add_worksheet('Swahili')
    worksheet_sw.set_column(0, 20, 30)
    render_menu('eng', worksheet_en, ROOT, fmt)
    global stack
    stack = []
    global stack2
    stack2 = []
    global row
    row = 1
    global prev_active
    prev_active = []
    for i in range(20):
        prev_active.append(None)
    render_menu('swa', worksheet_sw, ROOT, fmt)

    worksheet = workbook.add_worksheet('Test')
    header2 = workbook.add_format({
        'bold':     True,
        'align':    'center',
        'border':   6,
        'valign':   'vcenter',
        'fg_color': '#D7E4BC',
        'font_name': 'Calibri',
        'font_size': 12

    })
    header2.set_text_wrap()
    worksheet.merge_range('B4:F6', "CompanyName:ABC \n Country:India", header2)

    workbook.close()


stack = []
stack2 = []

row = 1
prev_active = []
for i in range(20):
    prev_active.append(None)


def render_menu(lang, worksheet, menu, fmt):
    global row
    global prev_active
    m_size = len(menu['menus'])
    for m in menu['menus']:
        r = present_menu(lang, worksheet, menu)
        stack.append(r)
        stack2.append(m['name'])
        render_menu(lang, worksheet, m, fmt)
    if not m_size:
        max_rows = 0
        for i, it in enumerate(stack):
            total_chars = 0
            type = 'OPTIONS'
            '''for j, m in enumerate(it):
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
                    worksheet.write(row + j, 1 + i * 2,
                                    '{}. {}'.format(j, m), fmt['default'])
                    total_chars = total_chars + 3
                if j == len(it) - 1:
                    worksheet.write_number(row + max_rows, 1 + i * 2,
                                           total_chars, fmt['ttchars'])
            '''
            if not len(it):
                continue
            max_rows = max(max_rows, len(it))
            total_chars = total_chars + len(it[0])
            worksheet.write(row + 0, 1 + i * 2, it[0], fmt['label'])
            it.pop(0)

            txt = '\n'.join(it)

            worksheet.write(row + 1, 1 + i * 2,
                            '{}'.format(txt), fmt['default'])
            total_chars = total_chars + 3

            prev_active[i] = stack2[i]
            print('{} - {}'.format(prev_active[i], stack2[i]))
        row = row + max_rows + 3
    if len(stack) > 0:
        stack.pop()
    if len(stack2) > 0:
        stack2.pop()


def present_menu(lang, worksheet, menu):
    menu_repr = [menu['name']]
    for m in menu['menus']:
        menu_repr.append(m.get(lang, m['name']))
    return menu_repr
