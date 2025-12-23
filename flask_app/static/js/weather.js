// Weather code to description and icon mapping
const weatherCodes = {
    0: { desc: 'Clear Sky', icon: '☀️' },
    1: { desc: 'Mainly Clear', icon: '🌤️' },
    2: { desc: 'Partly Cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Rime Fog', icon: '🌫️' },
    51: { desc: 'Light Drizzle', icon: '🌦️' },
    53: { desc: 'Drizzle', icon: '🌦️' },
    55: { desc: 'Heavy Drizzle', icon: '🌧️' },
    61: { desc: 'Light Rain', icon: '🌧️' },
    63: { desc: 'Rain', icon: '🌧️' },
    65: { desc: 'Heavy Rain', icon: '⛈️' },
    71: { desc: 'Light Snow', icon: '🌨️' },
    73: { desc: 'Snow', icon: '❄️' },
    75: { desc: 'Heavy Snow', icon: '❄️' },
    77: { desc: 'Snow Grains', icon: '❄️' },
    80: { desc: 'Light Showers', icon: '🌦️' },
    81: { desc: 'Showers', icon: '🌧️' },
    82: { desc: 'Heavy Showers', icon: '⛈️' },
    85: { desc: 'Light Snow Showers', icon: '🌨️' },
    86: { desc: 'Snow Showers', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm w/ Hail', icon: '⛈️' },
    99: { desc: 'Heavy Thunderstorm', icon: '⛈️' }
};

// Convert wind direction degrees to compass
function degreesToCompass(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// Load and display weather data
async function loadWeather() {
    try {
        const response = await fetch('/api/weather');
        const data = await response.json();

        if (data.error) {
            console.error('Weather API error:', data.error);
            return;
        }

        // Update location
        const locResponse = await fetch('/api/location');
        const locData = await locResponse.json();
        document.getElementById('locationName').textContent =
            `${locData.city}, ${locData.country}`;

        // Update current weather
        const current = data.current;
        const weatherInfo = weatherCodes[current.weather_code] || { desc: 'Unknown', icon: '❓' };

        document.getElementById('weatherIcon').textContent = weatherInfo.icon;
        document.getElementById('currentTemp').textContent =
            Math.round(current.temperature_2m);
        document.getElementById('weatherDesc').textContent = weatherInfo.desc;
        document.getElementById('feelsLike').textContent =
            `${Math.round(current.apparent_temperature)}°F`;
        document.getElementById('humidity').textContent =
            `${current.relative_humidity_2m}%`;
        document.getElementById('precipitation').textContent =
            `${current.precipitation.toFixed(2)}"`;

        // Update wind data
        const windSpeed = Math.round(current.wind_speed_10m);
        document.getElementById('windSpeed').textContent = windSpeed;
        document.getElementById('windDir').textContent =
            `${degreesToCompass(current.wind_direction_10m)} • ${windSpeed} KTS`;
        document.getElementById('windGusts').textContent =
            Math.round(current.wind_gusts_10m);

        // Update wave data (if available)
        if (data.marine && data.marine.current) {
            const marine = data.marine.current;
            // Convert meters to feet
            const waveHeightFt = (marine.wave_height * 3.28084).toFixed(1);
            document.getElementById('waveHeight').textContent = waveHeightFt;
            document.getElementById('waveDir').textContent =
                `${degreesToCompass(marine.wave_direction)} • ${waveHeightFt} FT`;
            document.getElementById('wavePeriod').textContent =
                marine.wave_period.toFixed(1);
        } else {
            document.getElementById('waveHeight').textContent = 'N/A';
            document.getElementById('waveDir').textContent = '---';
            document.getElementById('wavePeriod').textContent = 'N/A';
        }

        // Update 7-day forecast
        const forecastGrid = document.getElementById('forecastGrid');
        forecastGrid.innerHTML = '';

        const daily = data.daily;
        for (let i = 0; i < 7; i++) {
            const date = new Date(daily.time[i]);
            const dayName = i === 0 ? 'TODAY' :
                date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

            const forecastInfo = weatherCodes[daily.weather_code[i]] ||
                { desc: 'Unknown', icon: '❓' };

            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon">${forecastInfo.icon}</div>
                <div class="forecast-temp">${Math.round(daily.temperature_2m_max[i])}°</div>
                <div class="forecast-temp-low">${Math.round(daily.temperature_2m_min[i])}°</div>
            `;
            forecastGrid.appendChild(forecastItem);
        }

        // Update last update time
        const now = new Date();
        document.getElementById('lastUpdate').textContent =
            `UPDATED ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    } catch (error) {
        console.error('Error loading weather:', error);
    }
}

// Update clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}:${seconds}`;
}

// Initialize
loadWeather();
updateClock();
setInterval(updateClock, 1000);

// Refresh weather every 10 minutes
setInterval(loadWeather, 600000);