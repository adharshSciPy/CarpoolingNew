// src/utils.js
import axios from "axios";

const apiKey = "5b3ce3597851110001cf62484eb817f85d3b4acd9d1a7e1fdf05d60c"; // ✅ Use your real API key

const getDistanceInKm = async (start, end) => {
  const geocodeURL = "https://api.openrouteservice.org/geocode/search";

  const fetchCoordinates = async (location) => {
    const res = await axios.get(geocodeURL, {
      params: {
        api_key: apiKey,
        text: location,
        size: 1,
      },
    });

    const coords = res.data.features[0]?.geometry.coordinates;
    if (!coords || coords.length !== 2) {
      console.error("❌ Invalid coordinates for:", location, res.data);
      throw new Error(`Could not resolve coordinates for ${location}`);
    }

    return coords; // [longitude, latitude]
  };

  try {
    const startCoords = await fetchCoordinates(start);
    const endCoords = await fetchCoordinates(end);

    console.log("📍 Coordinates fetched:", { startCoords, endCoords });

    const directionURL = "https://api.openrouteservice.org/v2/directions/driving-car";
    const body = {
      coordinates: [startCoords, endCoords],
    };

    console.log("📦 Sending coordinates to API:", body);

    const response = await axios.post(directionURL, body, {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
    });

    const distanceInMeters = response.data.routes[0].summary.distance;
    const distanceKm = distanceInMeters / 1000;
    console.log("✅ Distance:", distanceKm, "km");

    return distanceKm;
  } catch (err) {
    console.error("❌ Direction API Error:", err.response?.data || err.message);
    throw err;
  }
};

export default getDistanceInKm;
