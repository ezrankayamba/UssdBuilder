from app import export_excel
from flask import render_template, request, send_file
from flask import Flask
import os
import json
from app import utils
app = Flask(__name__)


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/get_menu', methods=['GET'])
def get_menu():
    return utils.read_data()


@app.route('/export_menu', methods=['GET'])
def export_menu():
    dirpath = os.getcwd()
    path = os.path.join(dirpath, "export.xlsx")
    export_excel.export_menu_run(path)
    return send_file(path, as_attachment=True)


@app.route('/update_menu', methods=['POST'])
def update_menu():
    data = request.data.decode('utf-8')
    utils.write_data(data)
    return json.dumps({'success': True})
