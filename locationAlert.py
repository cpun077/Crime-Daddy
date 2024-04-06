from flask import Flask, request, jsonify
from supabase import create_client
from geopy.distance import geodesic

app = Flask(__name__)

# Setup Supabase client
url = "https://kjoqipddoeeaquhbztgv.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqb3FpcGRkb2VlYXF1aGJ6dGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI0MjM2NzEsImV4cCI6MjAyNzk5OTY3MX0.Ou9DqbpFRumG2ubbnqxNhyVv7bQNNkgSAQLjk52RmgY"  # Replace with your Supabase project URL
supabase = create_client(url, key)

def is_within_range(user_location, crime_location, range_km=10):
    """Check if the crime location is within the specified range of the user location."""
    distance = geodesic(user_location, crime_location).kilometers
    return distance <= range_km

def get_crimes_near_user(user_location, range_km=5):  # Adjusted default range to 5km as per your requirement
    """Retrieve crimes that occurred within a specified range of the user's location."""
    relevant_crimes = []
    crimes = supabase.table('CrimeReports').select('*').execute().data
    
    for crime in crimes:
        crime_location = (crime['Latitude'], crime['Longitude'])
        if is_within_range(user_location, crime_location, range_km):
            relevant_crimes.append(crime)  # Or format this data as needed
            
    return relevant_crimes

@app.route('/check-crimes', methods=['POST'])
def check_crimes():
    data = request.json
    user_location = (data['latitude'], data['longitude'])
    crimes = get_crimes_near_user(user_location, 5)  # 5 km radius
    if crimes:
        message = f"Alert: {len(crimes)} crimes reported within 5km radius."
    else:
        message = "No crimes reported within 5km radius."
    return jsonify({'message': message})

if __name__ == '__main__':
    app.run(debug=True)
