import pandas as pd
import folium
from folium.plugins import HeatMap

# Load your CSV file
df = pd.read_csv('Police_Department_Incident_Reports__2018_to_Present_20240405.csv')
df = df.dropna(subset=['Latitude', 'Longitude'])
print(df)

#Assuming your CSV has 'Latitude' and 'Longitude' columns
#Adjust these column names as per your CSV file
#Create a map centered around an average location or a specific point of interest
map = folium.Map(location=[df['Latitude'].mean(), df['Longitude'].mean()], zoom_start=12)

#Create a HeatMap layer and add it to the map
HeatMap(data=df[['Latitude', 'Longitude']], radius=10).add_to(map)

#Save the map to an HTML  
map.save('heatmap.html')

#This will create an HTML file named 'heatmap.html' in your current directory,
#which you can open in a web browser to view the heat map.