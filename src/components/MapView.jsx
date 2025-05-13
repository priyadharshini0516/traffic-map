import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import './MapView.css';

import { FaRoute, FaTrashAlt, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const MapView = () => {
  const mapRef = useRef(null);
  const routeRef = useRef(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    if (mapRef.current !== null) return;

    const map = L.map('map').setView([13.0827, 80.2707], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.Control.geocoder().addTo(map);

    const speak = (message) => {
      if (!voiceEnabled) return;
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    };

    document.getElementById('show-route-btn').onclick = () => {
      if (routeRef.current) {
        map.removeControl(routeRef.current);
      }
      routeRef.current = L.Routing.control({
        waypoints: [
          L.latLng(13.0827, 80.2707),
          L.latLng(13.067439, 80.237617)
        ],
        createMarker: function(i, waypoint, n) {
          return L.marker(waypoint, { draggable: true });
        },
        routeWhileDragging: true
      })
        .on('routesfound', function (e) {
          const summary = e.routes[0].summary;
          speak(`Route found. Total distance is ${(summary.totalDistance / 1000).toFixed(2)} kilometers.`);
        })
        .addTo(map);
    };

    document.getElementById('clear-route-btn').onclick = () => {
      if (routeRef.current) {
        map.removeControl(routeRef.current);
        routeRef.current = null;
        speak('Route cleared');
      }
    };

    document.getElementById('toggle-voice-btn').onclick = () => {
      setVoiceEnabled(prev => {
        const newState = !prev;
        if (newState) speak("Voice guidance activated.");
        else window.speechSynthesis.cancel();
        return newState;
      });
    };

  }, [voiceEnabled]);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div id="map" style={{ height: '100%', width: '100%' }}></div>
      <div className="map-controls">
        <button className="control-btn" id="show-route-btn">
          <FaRoute style={{ marginRight: '6px' }} />
          Show Route
        </button>
        <button className="control-btn" id="clear-route-btn">
          <FaTrashAlt style={{ marginRight: '6px' }} />
          Clear Route
        </button>
        <button className="control-btn" id="toggle-voice-btn">
          {voiceEnabled ? (
            <>
              <FaVolumeUp style={{ marginRight: '6px' }} /> Voice Off
            </>
          ) : (
            <>
              <FaVolumeMute style={{ marginRight: '6px' }} /> Voice On
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MapView;
