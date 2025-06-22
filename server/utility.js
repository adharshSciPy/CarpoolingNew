// ✅ utility.js
const axios = require("axios");

const getRoutePolyline = async (start, end) => {
  const apiKey = "5b3ce3597851110001cf62484eb817f85d3b4acd9d1a7e1fdf05d60c";
  const geocodeURL = "https://api.openrouteservice.org/geocode/search";
  const directionURL = "https://api.openrouteservice.org/v2/directions/driving-car";

  const fetchCoordinates = async (location) => {
    const res = await axios.get(geocodeURL, {
      params: {
        api_key: apiKey,
        text: location,
        size: 1,
      },
    });

    const coords = res.data.features[0]?.geometry.coordinates;
    if (!coords) throw new Error(`Could not resolve coordinates for ${location}`);
    return coords; // [lng, lat]
  };

  const startCoords = await fetchCoordinates(start);
  const endCoords = await fetchCoordinates(end);

  const body = {
    coordinates: [startCoords, endCoords],
  };

  const res = await axios.post(directionURL, body, {
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
  });

  return res.data.routes[0].geometry; // encoded polyline
};

// ✅ Fix the export
module.exports = getRoutePolyline;
