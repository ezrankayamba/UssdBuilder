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
    if os.path.exists(path):
        os.remove(path)
    workbook = xlsxwriter.Workbook(path)
    menu_head_format = workbook.add_format({'bold': True})
    worksheet = workbook.add_worksheet()
    #worksheet.write('A1', 'Hello world')
    row = 0
    col = 0
    ROOT = json.loads(data)
    render_menu(worksheet, row, col, ROOT)
    workbook.close()
    return send_file(path, as_attachment=True)


def cell(row, col):
    l = chr(ord('A') + col)
    return '{}:{}'.format(l, row)


def render_menu(worksheet, row, col, menu):
    last_row = row
    for m in menu['menus']:
        tmp = present_menu(worksheet, row+1, col, menu)
        if tmp > last_row:
            last_row = tmp
        row = render_menu(worksheet, last_row, col+1, m) + 1
    return last_row


def present_menu(worksheet, row, col, menu):
    worksheet.write(row, col, menu['name'], menu_head_format)
    for m in menu['menus']:
        row = row+1
        worksheet.write(row, col, m['name'])
    return row+1


'''def render_menu(worksheet, row, col, menu):
    padd = ' '*col*2
    c = cell(row, col)
    padd = '{}{}'.format(padd, c)
    print('{} {}.{} - {}'.format(padd, row, col, menu['name']))
    worksheet.write(row, col, menu['name'])
    for m in menu['menus']:
        render_menu(worksheet, row, col+1, m)
        row = row+1
    return row+1
'''


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
