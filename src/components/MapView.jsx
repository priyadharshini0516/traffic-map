import React, { useEffect, useState } from 'react';
import L from 'leaflet';
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

    // Delay geolocation slightly to ensure map is fully loaded
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

    // Geocoder search bar
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

  return <div id="map" style={{ height: '100vh', width: '100%' }}></div>;
};

export default MapView;
