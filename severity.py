import json
import logging
import time
import urllib.request
from datetime import datetime
from pprint import pprint

import pandas as pd

from crime_sender import send_message
from supabase import Client, create_client
from severity_ranker import extract_information

with open("config.json", "r") as jsonFile:
    config = json.load(jsonFile)
columns = config["columns"]
data_url = config["data_url"]
with urllib.request.urlopen(data_url) as url:
    data = json.load(url)

df = pd.DataFrame(data)
df = df[columns]
df["Severity"] = 1
for i in range(1000):
    incident = df.iloc[i]
    info = extract_information(incident.incident_description)
    if len(info) > 2:
        severity = 1
    else:
        severity = int(info)
    df.at[i, "Severity"] = severity
    print(incident.incident_description, "  :  ", severity)
print(df)
df.to_csv("reports.csv", encoding='utf-8', index=False)