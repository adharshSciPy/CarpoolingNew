// components/RideMap.js
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

const centerOfPoints = (points) => {
  const lat = (points[0][0] + points[1][0]) / 2;
  const lng = (points[0][1] + points[1][1]) / 2;
  return [lat, lng];
};

const FlyToBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 2) {
      map.fitBounds(positions, { padding: [50, 50] });
    }
  }, [map, positions]);
  return null;
};

const LocationMap = ({ startCoords, endCoords }) => {
  const positions = [startCoords, endCoords];

  return (
    <MapContainer
      center={centerOfPoints(positions)}
      zoom={10}
      style={{ height: "300px", width: "100%", borderRadius: "12px", marginTop: "1rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={startCoords} icon={L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", iconSize: [25, 41], iconAnchor: [12, 41] })} />
      <Marker position={endCoords} icon={L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", iconSize: [25, 41], iconAnchor: [12, 41] })} />
      <Polyline positions={positions} color="blue" />
      <FlyToBounds positions={positions} />
    </MapContainer>
  );
};

export default LocationMap;
