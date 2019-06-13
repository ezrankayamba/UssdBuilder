from flask import render_template, request, send_file
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import xlsxwriter
import requests
import xmltodict
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
    import os

    dirpath = os.getcwd()
    path = '{}/export.xlsx'.format(dirpath)
    workbook = xlsxwriter.Workbook(file)
    worksheet = workbook.add_worksheet()
    worksheet.write('A1', 'Hello world')
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
