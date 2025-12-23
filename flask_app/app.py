from flask import Flask, render_template, jsonify
import requests
import os
import random

import openmeteo_requests
import requests_cache
from retry_requests import retry


app = Flask(__name__)
# cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
# retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
# openmeteo = openmeteo_requests.Client(session = retry_session)

@app.route('/')
def home():
    return render_template('navigation.html')

@app.route('/memories')
def memories():
    return render_template('memories.html')

@app.route('/weather')
def weather():
    return render_template('weather.html')

@app.route('/api/location')
def get_location():
    try:
        # Get location from IP (approximate)
        response = requests.get('http://ip-api.com/json/')
        data = response.json()
        return jsonify({
            'lat': data.get('lat', 0),
            'lon': data.get('lon', 0),
            'city': data.get('city', 'Unknown'),
            'country': data.get('country', 'Unknown')
        })
    except:
        # Default fallback location
        return jsonify({
            'lat': 40.7128,
            'lon': -74.0060,
            'city': 'Default',
            'country': 'Location'
        })
    
@app.route('/api/photos')
def get_photos():
    photos_dir = os.path.join(app.static_folder, 'photos')

    if not os.path.exists(photos_dir):
        os.makedirs(photos_dir)
    
    valid_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.JPG')
    photos = []
    
    try:
        for filename in os.listdir(photos_dir):
            if filename.lower().endswith(valid_extensions):
                photos.append(f'/static/photos/{filename}')
        random.shuffle(photos)
        
    except Exception as e:
        print(f"Error reading photos: {e}")
    
    return jsonify({'photos': photos})

@app.route('/api/weather')
def get_weather():
    try:
        # Get location first
        loc_response = requests.get('http://ip-api.com/json/')
        loc_data = loc_response.json()
        lat = loc_data.get('lat', 40.7128)
        lon = loc_data.get('lon', -74.0060)
        
        # Get weather from Open-Meteo (FREE, no API key needed!)
        weather_url = 'https://api.open-meteo.com/v1/forecast'
        params = {
            'latitude': lat,
            'longitude': lon,
            'current': 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
            'hourly': 'temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m',
            'daily': 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max',
            'temperature_unit': 'fahrenheit',
            'wind_speed_unit': 'kn',
            'precipitation_unit': 'inch',
            'timezone': 'auto',
            'forecast_days': 7
        }
        
        weather_response = requests.get(weather_url, params=params)
        weather_data = weather_response.json()
        
        # Get marine data (waves) from Open-Meteo Marine API
        marine_url = 'https://marine-api.open-meteo.com/v1/marine'
        marine_params = {
            'latitude': lat,
            'longitude': lon,
            'current': 'wave_height,wave_direction,wave_period',
            'hourly': 'wave_height,wave_direction,wave_period',
            'timezone': 'auto'
        }
        
        try:
            marine_response = requests.get(marine_url, params=marine_params)
            marine_data = marine_response.json()
            # Merge marine data into weather response
            result = weather_data.copy()
            result['marine'] = marine_data
            return jsonify(result)
        except:
            return jsonify(weather_data)
        
    except Exception as e:
        print(f"Weather API error: {e}")
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)