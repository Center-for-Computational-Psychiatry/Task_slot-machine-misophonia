from . import db  # accesses db from __init__,py
from flask_login import UserMixin


class Participant(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    pid = db.Column(db.String(100))
    miso_trigger = db.Column(db.String(100))
    reversal_timings = db.Column(db.String(10))
    base_mood_rating = db.Column(db.Integer)
    timestamp = db.Column(db.Float)
    choices_order=db.Column(db.String(100))
    
    taskdata = db.relationship("TaskData")
    triggerdata = db.relationship("TriggerData")


class TaskData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # run = db.Column(db.Integer)
    pid = db.Column(db.String(100))
    # block = db.Column(db.Integer)
    # block_type = db.Column(db.String(50))
    trial_num = db.Column(db.Integer)
    cue_time = db.Column(db.Float)
    action = db.Column(db.Integer)
    action_time = db.Column(db.Float)
    reward = db.Column(db.Integer)
    reward_time = db.Column(db.Float)
    rt = db.Column(db.Float)
    spinspeed = db.Column(db.String(50))
    mood_rating = db.Column(db.Integer)

    pid_db = db.Column(db.Integer, db.ForeignKey("participant.id"))


class TriggerData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    run = db.Column(db.Integer)
    pid = db.Column(db.String(100))
    trigger = db.Column(db.Float)

    pid_db = db.Column(db.Integer, db.ForeignKey("participant.id"))
