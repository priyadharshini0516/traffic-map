import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapView = () => {
  const position = [13.0827, 80.2707]; // Chennai center

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41] })}>
        <Popup>You are here (Chennai)</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;
