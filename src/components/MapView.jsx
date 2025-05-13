import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import './MapView.css';

const MapView = () => {
  const mapRef = useRef(null);
  const routingRef = useRef(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [synth] = useState(window.speechSynthesis);

  const startCoords = [13.0827, 80.2707]; // Chennai by default
  const endCoords = [13.0352, 80.2086];   // Sample destination

  useEffect(() => {
    mapRef.current = L.map('map').setView(startCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Geocoder control
    L.Control.geocoder({
      defaultMarkGeocode: true,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current.remove();
    };
  }, []);

  const handleShowRoute = () => {
    if (routingRef.current) return;

    routingRef.current = L.Routing.control({
      waypoints: [L.latLng(startCoords), L.latLng(endCoords)],
      routeWhileDragging: false,
      createMarker: function () { return null; },
    })
    .on('routesfound', function (e) {
      const route = e.routes[0];
      route.coordinates.forEach((coord, index) => {
        // Check for 50m before any coordinate
        if (index > 0) {
          const dist = coord.distanceTo(route.coordinates[index - 1]);
          if (dist > 50) {
            if (voiceEnabled) {
              speakText('Speed breaker ahead in 50 meters');
            }
          }
        }
      });
    })
    .addTo(mapRef.current);
  };

  const handleClearRoute = () => {
    if (routingRef.current) {
      mapRef.current.removeControl(routingRef.current);
      routingRef.current = null;
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  return (
    <>
      <div className="map-controls">
        <div className="quick-buttons">
          <button className="quick-btn" onClick={handleShowRoute}>Show Route</button>
          <button className="quick-btn" onClick={handleClearRoute}>Clear Route</button>
          <button className="quick-btn" onClick={() => setVoiceEnabled(true)}>Start Voice</button>
          <button className="quick-btn" onClick={() => {
            synth.cancel();
            setVoiceEnabled(false);
          }}>Stop Voice</button>
        </div>
      </div>
      <div id="map"></div>
    </>
  );
};

export default MapView;
