from flask import Blueprint, render_template, request
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import requests
import xmltodict
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../../tigopesa.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

transtest_bp = Blueprint('transtest', __name__, template_folder='templates')


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


@transtest_bp.route('/transtest/apiaudit')
def apiaudit():
    audits = APIAudit.query.order_by(
        db.desc(APIAudit.created_on)).limit(20).all()
    return render_template('audits.html', audits=audits)


@transtest_bp.route('/transtest/api_call', methods=['POST'])
def api_call():
    xml = request.data.decode("utf-8")
    print(xml)
    doc = xmltodict.parse(xml)
    usr = doc['TCSRequest']['UserName']
    funParams = doc['TCSRequest']['Function']
    if 'Param11' in funParams:
        ref_number = funParams['Param11']
    else:
        ref_number = 'No ref'
    service_name = request.headers.get('ServiceName')
    print('Ref#: ', ref_number)
    api = APIAudit()
    api.request = xml
    api.ip_address = request.remote_addr
    api.ref_number = ref_number
    api.user_name = usr
    api.service_name = service_name
    db.session.add(api)
    db.session.commit()
    headers = {'Content-Type': 'text/xml'}
    r = requests.post("http://10.99.1.161:6060/TELEPIN",
                      data=xml, headers=headers)
    res_xml = r.text
    print(res_xml)
    doc = xmltodict.parse(res_xml)
    res = doc['TCSReply']['Result']
    msg = doc['TCSReply']['Message']
    api = APIAudit.query.get(api.id)
    api.response = r.text
    api.result = res
    api.message = msg
    db.session.commit()
    return res_xml
