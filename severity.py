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

dp = {}
df = pd.read_csv("client/public/final_reports.csv")
df = df[df['Latitude'].notna()]
df = df[df['Longitude'].notna()]
df = df[df["Incident Year"] == 2022]
print(df)
"""
df["Severity"] = 1
for index, row in df.iterrows():
    print(index, len(dp))
    desc = row["Incident Description"]
    if desc in dp:
        df.at[index, "Severity"] = dp[desc]
        continue
    info = extract_information(desc)
    if len(info) > 2:
        severity = 1
    else:
        severity = int(info)
    df.at[index, "Severity"] = severity
    dp[desc] = severity


print(df)
df.to_csv("full_reports.csv", encoding='utf-8', index=False)
"""