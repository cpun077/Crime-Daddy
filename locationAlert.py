import json
from flask import Flask, request, jsonify
from supabase import create_client
from geopy.distance import geodesic
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load configuration from config.json
with open("config.json", "r") as jsonFile:
    config = json.load(jsonFile)

# Setup Supabase client with loaded configuration
supabase = create_client(config["url"], config["key"])

def is_within_range(user_location, crime_location, range_km=10):
    """Check if the crime location is within the specified range of the user location."""
    distance = geodesic(user_location, crime_location).kilometers
    return distance <= range_km

def get_crimes_near_user(user_location, range_km=5):
    """Retrieve crimes that occurred within a specified range of the user's location."""
    relevant_crimes = []
    crimes = supabase.table('CrimeReports').select('*').execute().data
    
    for crime in crimes:
        crime_location = (crime['latitude'], crime['longitude'])  # Ensure these match your column names
        if is_within_range(user_location, crime_location, range_km):
            relevant_crimes.append(crime)
            
    return relevant_crimes

@app.route('/check-crimes', methods=['POST'])
def check_crimes():
    data = request.json
    user_location = (data['latitude'], data['longitude'])
    crimes = get_crimes_near_user(user_location, 5)  # 5 km radius
    
    return jsonify({'crimes': crimes})

if __name__ == '__main__':
    app.run(debug=True)
