import React, { useEffect } from 'react';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import './MapView.css';

const MapView = () => {
  useEffect(() => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    const map = L.map('map').setView([13.0827, 80.2707], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // My Location Button Handler
    const locateUser = () => {
      map.locate({ setView: true, maxZoom: 16 });
    };

    // On first load
    locateUser();

    map.on('locationfound', (e) => {
      L.marker(e.latlng).addTo(map).bindPopup('You are here').openPopup();
    });

    // Geocoder Search Bar (no popup)
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on('markgeocode', function (e) {
        const center = e.geocode.center;
        map.setView(center, 15);

        L.marker(center)
          .addTo(map)
          .bindPopup(`📍 ${e.geocode.name}`)
          .openPopup();
      })
      .addTo(map);

    // Fetch alerts from backend
    axios.get('http://localhost:5000/alerts')
      .then(response => {
        response.data.forEach(alert => {
          L.marker([alert.lat, alert.lng])
            .addTo(map)
            .bindPopup(`<b>${alert.type}</b><br>${alert.message}`);
        });
      })
      .catch(error => {
        console.error("Error fetching alerts:", error);
      });

    // Button Event
    document.getElementById('locate-btn').addEventListener('click', locateUser);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div>
      <div id="map" style={{ height: '100vh', width: '100%' }} />
      <button id="locate-btn" className="map-btn">📍 My Location</button>
    </div>
  );
};

export default MapView;
