import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import './MapView.css';

const MapView = () => {
  const [mapInstance, setMapInstance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);

  useEffect(() => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const map = L.map('map').setView([13.0827, 80.2707], 13);
    setMapInstance(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    setTimeout(() => {
      map.locate({ setView: true, maxZoom: 16 });
    }, 300);

    map.on('locationfound', (e) => {
      setUserLocation(e.latlng);
      L.marker(e.latlng)
        .addTo(map)
        .bindPopup('You are here')
        .openPopup();
    });

    axios.get('http://localhost:5000/alerts')
      .then(response => {
        response.data.forEach(alert => {
          L.marker([alert.lat, alert.lng], {
            icon: L.icon({
              iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png',
              iconSize: [30, 30],
              iconAnchor: [15, 30],
              popupAnchor: [0, -30],
            })
          })
            .addTo(map)
            .bindPopup(`<b>${alert.type}</b><br>${alert.message}`);
        });
      })
      .catch(err => console.error('Error fetching alerts:', err));

    const speedBreakers = [
      { lat: 13.083, lng: 80.271 },
      { lat: 13.078, lng: 80.265 }
    ];

    setInterval(() => {
      if (!userLocation) return;

      speedBreakers.forEach(breaker => {
        const distance = map.distance(userLocation, L.latLng(breaker.lat, breaker.lng));
        if (distance <= 50) {
          alert('⚠️ Speed breaker ahead in 50 meters!');
        }
      });
    }, 5000);

    setTimeout(() => {
      const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false
      })
        .on('markgeocode', function (e) {
          const destination = e.geocode.center;
          map.setView(destination, 15);

          L.marker(destination, {
            icon: L.icon({
              iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -32],
            })
          })
            .addTo(map)
            .bindPopup(`📍 ${e.geocode.name}`)
            .openPopup();

          const highTrafficZones = [
            { lat: 13.0827, lng: 80.2707, radius: 300 },
            { lat: 13.075, lng: 80.255, radius: 300 }
          ];

          function isInTrafficZone(latlng) {
            return highTrafficZones.some(zone => {
              const dist = map.distance(latlng, L.latLng(zone.lat, zone.lng));
              return dist < zone.radius;
            });
          }

          if (isInTrafficZone(destination)) {
            alert('⚠️ You are navigating into a high traffic zone!');
          }

          if (userLocation) {
            if (routingControl) {
              routingControl.setWaypoints([userLocation, destination]);
            } else {
              const newControl = L.Routing.control({
                waypoints: [userLocation, destination],
                routeWhileDragging: true,
                showAlternatives: true,
                lineOptions: {
                  styles: [{ color: 'blue', weight: 5 }]
                },
                createMarker: (i, waypoint, n) => {
                  return L.marker(waypoint.latLng);
                }
              }).addTo(map);
              setRoutingControl(newControl);
            }
          } else {
            alert('User location not available. Please allow location access.');
          }
        })
        .addTo(map);
    }, 500);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div>
      <div id="map" style={{ height: '100vh', width: '100%' }}></div>
      <button
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          padding: '10px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={() => {
          if (routingControl) {
            routingControl.setWaypoints([]);
            routingControl.remove();
          }
        }}
      >
        ❌ Clear Route
      </button>
    </div>
  );
};

export default MapView;
