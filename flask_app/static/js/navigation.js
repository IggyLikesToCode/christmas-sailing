let map, marker, heading = 0;
let lastPosition = null;

function initMap(lat, lon) {
    map = L.map('map', {
        zoomControl: false
    }).setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
    }).addTo(map);

    const shipIcon = L.divIcon({
        className: 'ship-marker',
        html: '<div style="width: 20px; height: 20px; background: #ef5350; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 15px #ef5350;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    marker = L.marker([lat, lon], { icon: shipIcon }).addTo(map);

    map.on('zoomend', function () {
        document.getElementById('zoom').textContent = map.getZoom();
    });
}

function updatePosition(lat, lon, city, country) {
    document.getElementById('lat').textContent = lat.toFixed(6) + '°';
    document.getElementById('lon').textContent = lon.toFixed(6) + '°';
    document.getElementById('city').textContent = city.toUpperCase();
    document.getElementById('country').textContent = country.toUpperCase();

    if (marker) {
        marker.setLatLng([lat, lon]);

        if (lastPosition) {
            const newHeading = calculateBearing(lastPosition.lat, lastPosition.lon, lat, lon);
            if (!isNaN(newHeading)) {
                heading = newHeading;
                updateCompass(heading);
            }
        }
        lastPosition = { lat, lon };
    }
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
        Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
}

function updateCompass(degrees) {
    document.getElementById('needle').style.transform =
        `translate(-50%, -100%) rotate(${degrees}deg)`;
    document.getElementById('heading').textContent =
        Math.round(degrees).toString().padStart(3, '0') + '°';

    const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    document.getElementById('cardinal').textContent = cardinals[index];
}

function updateTime() {
    const now = new Date();
    document.getElementById('utc').textContent =
        now.toUTCString().split(' ')[4];
    document.getElementById('local').textContent =
        now.toTimeString().split(' ')[0];
}

function simulateSpeed() {
    const speed = (Math.random() * 5 + 2).toFixed(1);
    document.getElementById('speed').textContent = speed + ' kts';
}

// Fetch location from Flask backend
fetch('/api/location')
    .then(response => response.json())
    .then(data => {
        initMap(data.lat, data.lon);
        updatePosition(data.lat, data.lon, data.city, data.country);
    })
    .catch(error => {
        console.error('Error fetching location:', error);
        // Fallback to default location
        initMap(40.7128, -74.0060);
        updatePosition(40.7128, -74.0060, 'Default', 'Location');
    });

setInterval(updateTime, 1000);
updateTime();

setInterval(simulateSpeed, 2000);
simulateSpeed();

setInterval(() => {
    heading = (heading + (Math.random() * 4 - 2) + 360) % 360;
    updateCompass(heading);
}, 3000);