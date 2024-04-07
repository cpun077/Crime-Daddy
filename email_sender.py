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

logging.getLogger("httpx").setLevel(logging.WARNING)

class CrimeReporter:
    def __init__(self):
        self.setup()

    def setup(self):
        with open("config.json", "r") as jsonFile:
            self.config = json.load(jsonFile)
        columns = self.config["columns"]
        data_url = self.config["data_url"]
        with urllib.request.urlopen(data_url) as url:
            data = json.load(url)

        self.df = pd.DataFrame(data)
        self.df = self.df[columns]
        self.supabase = create_client(self.config["url"], self.config["key"])

    def update(self):
        latest_time = self.config["latest_time"]
        latest_date = datetime.strptime(latest_time, "%Y-%m-%dT%H:%M:%S.%f")
        
        new_incidents = []
        for i in range(1000):
            incident = self.df.iloc[i]
            date = incident.incident_datetime
            date = datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%f")
            if date > latest_date:
                new_incidents.append(self.df.iloc[i])

        print(f"Reporting {len(new_incidents)} new incidents...")

        self.config["latest_time"] = self.df.iloc[0].incident_datetime
        with open("config.json", "w") as jsonFile:
            json.dump(self.config, jsonFile, indent=4)

        for incident in new_incidents:
            report = incident.to_dict()
            report["Recent"] = False
            info = extract_information(incident.incident_description)
            if len(info) > 2:
                severity = 1
            else:
                severity = int(info)
            report["Severity"] = severity
            data, count = self.supabase.table('CrimeReports').insert(report).execute()
            send_message(incident)


    def run(self):
        while True:
            print("Updating")
            self.update()
            time.sleep(300)

if __name__ == '__main__':
    reporter = CrimeReporter()
    reporter.run()
