import pandas as pd
import folium
from folium.plugins import HeatMap

# Load your CSV file
df = pd.read_csv('/Users/lukezheng/Downloads/Hackathon/Police_Department_Incident_Reports__2018_to_Present_20240405-2.csv')

# Drop rows where either Latitude or Longitude is NaN
df = df.dropna(subset=['Latitude', 'Longitude'])

# Create a map centered around an average location
map = folium.Map(location=[df['Latitude'].mean(), df['Longitude'].mean()], zoom_start=12)

# Create a HeatMap layer and add it to the map
HeatMap(data=df[['Latitude', 'Longitude']], radius=10).add_to(map)

# Save the map to an HTML file
map.save('heatmap.html')
