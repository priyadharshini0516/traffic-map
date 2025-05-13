import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './MapView.css';

const MapView = () => {
  const mapRef = useRef(null);
  const routeRef = useRef(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('map', {
      center: [13.0827, 80.2707],
      zoom: 13
    });

    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

     // Add search bar
    L.Control.geocoder().addTo(map);

      // Voice function
    const speak = (msg) => {
      if (!voiceEnabled) return;
      const utterance = new SpeechSynthesisUtterance(msg);
      window.speechSynthesis.speak(utterance);
    };

     // Show route
    document.getElementById('show-route-btn').onclick = () => {
      if (routeRef.current) map.removeControl(routeRef.current);

      routeRef.current = L.Routing.control({
        waypoints: [
          L.latLng(13.0827, 80.2707),
          L.latLng(13.067439, 80.237617)
        ],
        routeWhileDragging: true
      }).on('routesfound', (e) => {
        const summary = e.routes[0].summary;
        speak(`Route loaded. Distance: ${(summary.totalDistance / 1000).toFixed(2)} km.`);
      }).addTo(map);
    };

    document.getElementById('clear-route-btn').onclick = () => {
      if (routeRef.current) {
        map.removeControl(routeRef.current);
        routeRef.current = null;
        speak('Route cleared.');
      }
    };

    document.getElementById('toggle-voice-btn').onclick = () => {
      setVoiceEnabled((prev) => {
        const newState = !prev;
        if (!newState) window.speechSynthesis.cancel();
        else speak('Voice guidance activated.');
        return newState;
      });
    };
  }, [voiceEnabled]);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div id="map" style={{ height: '100%', width: '100%' }}></div>
      <div className="map-controls">
        <button className="control-btn" id="show-route-btn" title="Show Route">
          <i className="fas fa-route"></i> Show Route
        </button>
        <button className="control-btn" id="clear-route-btn" title="Clear Route">
          <i className="fas fa-times-circle"></i> Clear Route
        </button>
        <button className="control-btn" id="toggle-voice-btn" title="Toggle Voice">
          <i className="fas fa-volume-up"></i> {voiceEnabled ? 'Voice Off' : 'Voice On'}
        </button>
      </div>
    </div>
  );
};

export default MapView;
