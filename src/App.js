import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LocationScreen from './components/LocationScreen';
import MapView from './components/MapView';
// You can add ManualLocation if you plan to support that

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LocationScreen />} />
        <Route path="/map" element={<MapView />} />
        {/* Optional route */}
        {/* <Route path="/manual-location" element={<ManualLocation />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
