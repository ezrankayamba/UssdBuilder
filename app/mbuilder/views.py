from app.mbuilder import export_excel
from flask import Blueprint, render_template, request, send_file
from flask import Flask
import os
import json
from app.mbuilder import utils

mbuilder_bp = Blueprint('mbuilder', __name__, template_folder='templates')


@mbuilder_bp.route('/mbuilder')
def home():
    return render_template('home.html')


@mbuilder_bp.route('/mbuilder/get_menu', methods=['GET'])
def get_menu():
    return utils.read_data()


@mbuilder_bp.route('/mbuilder/export_menu', methods=['GET'])
def export_menu():
    dirpath = os.getcwd()
    path = os.path.join(dirpath, "export.xlsx")
    export_excel.export_menu_run(path)
    return send_file(path, as_attachment=True)


@mbuilder_bp.route('/mbuilder/update_menu', methods=['POST'])
def update_menu():
    data = request.data.decode('utf-8')
    utils.write_data(data)
    return json.dumps({'success': True})
