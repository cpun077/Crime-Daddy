import json
import os
import smtplib
import urllib.request
from datetime import datetime
from email.mime.text import MIMEText
from pprint import pprint

import pandas as pd
from supabase import Client, create_client

with open("config.json", "r") as jsonFile:
    config = json.load(jsonFile)

def construct_message(incident):
    subject = incident.incident_description
    time = incident.incident_datetime
    parsed_date = datetime.strptime(time, "%Y-%m-%dT%H:%M:%S.%f")
    date = parsed_date.date()
    time = parsed_date.time().strftime("%I:%M %p")

    body = f"""
Crime Report:

    Date: {date}
    Time: {time}
    Neighborhood: {incident.analysis_neighborhood}
    Intersection: {incident.intersection if incident.intersection else "Unknown"}
    Incident: {incident.incident_description}
    """

    return subject, body

def get_recipients():
    supabase = create_client(config["url"], config["key"])
    response = supabase.table("CrimeEmails").select("email").execute()
    recipients = [d["email"] for d in response.data]
    return recipients

def send_message(incident):
    subject, body = construct_message(incident)
    recipients = get_recipients()
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = config["sender"]
    msg['To'] = 'CrimeHaters'

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
       smtp_server.login(config["sender"], config["sender_passwd"])
       smtp_server.sendmail(config["sender"], recipients, msg.as_string())

