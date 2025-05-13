import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import './MapView.css';

const speak = (message) => {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(message);
  utter.lang = 'en-IN';
  synth.speak(utter);
};

const MapView = () => {
  const [mapInstance, setMapInstance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchedDestination, setSearchedDestination] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const instructionPopupRef = useRef(null);

  useEffect(() => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const map = L.map('map').setView([13.0827, 80.2707], 13);
    setMapInstance(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const speedBreakers = [
      { lat: 13.0815, lng: 80.2700 },
      { lat: 13.0840, lng: 80.2730 }
    ];

    speedBreakers.forEach(point => {
      L.marker([point.lat, point.lng], {
        icon: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30]
        })
      }).addTo(map).bindPopup('Speed Breaker');
    });

    setTimeout(() => {
      map.locate({ watch: true, setView: true, maxZoom: 16 });
    }, 300);

    map.on('locationfound', (e) => {
      const userPos = e.latlng;
      setUserLocation(userPos);

      // Speed breaker check
      speedBreakers.forEach(sb => {
        const dist = map.distance(userPos, L.latLng(sb.lat, sb.lng));
        if (dist <= 50) {
          speak('Speed breaker ahead in 50 meters.');
          L.popup()
            .setLatLng(userPos)
            .setContent('⚠️ Speed breaker ahead!')
            .openOn(map);
        }
      });

      L.marker(userPos)
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

    setTimeout(() => {
      const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false
      })
        .on('markgeocode', function (e) {
          const destination = e.geocode.center;
          setSearchedDestination(destination);
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
            const warning = 'Warning! You are navigating into a high traffic zone.';
            alert('⚠️ ' + warning);
            speak(warning);
          }
        })
        .addTo(map);
    }, 500);

    return () => {
      map.remove();
    };
  }, []);

  const handleShowRoute = () => {
    if (!mapInstance || !userLocation || !searchedDestination) {
      alert('User location or destination is missing');
      return;
    }

    if (routingControl) {
      routingControl.setWaypoints([userLocation, searchedDestination]);
    } else {
      const route = L.Routing.control({
        waypoints: [userLocation, searchedDestination],
        routeWhileDragging: false,
        lineOptions: {
          styles: [{ color: 'blue', weight: 4 }]
        },
        createMarker: (i, waypoint) => {
          return L.marker(waypoint.latLng);
        }
      })
        .on('routesfound', function (e) {
          const instructions = e.routes[0].instructions;
          instructions.forEach((inst, idx) => {
            setTimeout(() => {
              const direction = inst.text;
              const coord = inst.latLng || userLocation;
              speak(direction);

              if (instructionPopupRef.current) {
                instructionPopupRef.current.setLatLng(coord).setContent(`📢 ${direction}`).openOn(mapInstance);
              } else {
                instructionPopupRef.current = L.popup({ offset: [0, -10] })
                  .setLatLng(coord)
                  .setContent(`📢 ${direction}`)
                  .openOn(mapInstance);
              }
            }, idx * 4000);
          });
        })
        .addTo(mapInstance);

      setRoutingControl(route);
    }

    speak('Route has been displayed. Drive safe!');
  };

  const handleClearRoute = () => {
    if (routingControl) {
      routingControl.setWaypoints([]);
      routingControl.remove();
      setRoutingControl(null);
    }

    speak('Route has been cleared.');
  };

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
          backgroundColor: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={handleShowRoute}
      >
        🚗 Show Route
      </button>

      <button
        style={{
          position: 'absolute',
          top: 10,
          left: 130,
          zIndex: 1000,
          padding: '10px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={handleClearRoute}
      >
        ❌ Clear Route
      </button>
    </div>
  );
};

export default MapView;
