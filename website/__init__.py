from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import session
from os import path

db = SQLAlchemy()
DB_NAME = "database-misophonia.sqlite"


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "alskjdffasalskdjf"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)

    from .task import task

    app.register_blueprint(task, url_prefix="/")

    from .models import Participant, TaskData

    with app.app_context():
        db.create_all()
    # create_database(app) # from old version of the app, didn't work on latest version of flash

    return app

# BELOW CODE from old version of the app, didn't work on latest version of flash
# def create_database(app):
#     if not path.exists("website/" + DB_NAME):
#         db.create_all(app=app)
#         print("Created Database")
