from flask import Blueprint, render_template, request, jsonify
from flask import session
from .models import TaskData, Participant
from flask_login import current_user
from . import db
import time
import json

task = Blueprint("task", __name__)


@task.route("/slots-miso", methods=["GET"])
def run():
    return render_template("slots-miso.html")


@task.post("/save-participant")
def save_participant():
    data = json.loads(request.data)
    participant = Participant(
        pid=data["participant_id"],
        miso_trigger=data["miso_trigger"],
        choice_a=data["choice_a"],
        choice_b=data["choice_b"],
        choice_c=data["choice_c"],
        choice_d=data["choice_d"],
        choice_e=data["choice_e"],
        choice_f=data["choice_f"],
        reversal_timings=data["reversal_timings"],
        base_mood_rating=data["base_mood_rating"],
        timestamp=data["timestamp"]
    )
    db.session.add(participant)
    db.session.commit()
    session["pid_db"] = participant.id
    # session["prun_db"] = participant.run
    session["pid"] = participant.pid
    return jsonify({})


@task.post("/save-trial-data")
def save_trial_data():
    data = json.loads(request.data)
    taskdata = TaskData(
        pid=data["participant_id"],
        # block=data["block"],
        trial_num=data["trial_num"],
        cue_time=data["cue_time"],
        action=data["action"],
        action_time=data["action_time"],
        reward=data["reward"],
        reward_time=data["reward_time"],
        rt=data["action_time"] - data["cue_time"],
        spinspeed=data["trial_speed"],
        mood_rating=data["mood_rating"],
        pid_db=session["pid_db"],
    )
    db.session.add(taskdata)
    db.session.commit()
    return jsonify({})
