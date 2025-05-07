import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LocationScreen.css'; // Make sure this file exists with styles

const LocationScreen = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setErrorMsg('Permission to access location was denied or not supported');
      }
    );
  }, []);

  return (
    <div className="location-container">
      <img src="/images/lgbg.png" alt="Background" className="background-image" />

      <div className="location-box">
        <h2>Where are you?</h2>
        <p>
          {errorMsg
            ? errorMsg
            : userLocation
            ? `Your location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
            : 'Fetching your location...'}
        </p>

        <button
          className="locate-button"
          onClick={() => navigate('/map')}
        >
          📍 Locate Me
        </button>

        <p
          className="manual-select"
          onClick={() => navigate('/manual-location')}
        >
          Select location manually
        </p>
      </div>
    </div>
  );
};

export default LocationScreen;
