
from flask import Flask
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile('flask.cfg')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../../tigopesa.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


def register_bps(app):
    from app.mbuilder.views import mbuilder_bp
    app.register_blueprint(mbuilder_bp)
    from app.home.views import home_bp
    app.register_blueprint(home_bp)
    from app.transtest.views import transtest_bp
    app.register_blueprint(transtest_bp)


register_bps(app)
