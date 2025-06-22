import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { format, parseISO, isBefore } from "date-fns";
import { toast } from "react-toastify";
import getDistanceInKm from "../../utils.js";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { MapContainer, TileLayer, Marker, Polyline as LeafletPolyline } from "react-leaflet";
import L from "leaflet";
import "./style.css";
import { isPointNearPolyline } from "../../geolibUtil.js";
import axios from "axios";

const RideDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [seatCount, setSeatCount] = useState(1); // New state
  const [decodedPath, setDecodedPath] = useState([]);

  const isDriver = localStorage.getItem("role") === "driver";

  const defaultCenter = {
    lat: 10.8505,
    lng: 76.2711,
  };

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [pickupMarker, setPickupMarker] = useState(null);
  const [dropoffMarker, setDropoffMarker] = useState(null);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const { data } = await api.get(`/rides/${id}`);
        const rideData = data.data;
        setRide(rideData);

        if (rideData.routePolyline) {
          const decoded = polyline.decode(rideData.routePolyline);
          const path = decoded.map(([lat, lng]) => ({ lat, lng }));
          setDecodedPath(path);
          if (path.length) {
            setMapCenter(path[0]);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching ride details");
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [id]);

  const handleBookRide = async () => {
    if (!user) return navigate("/login");

    if (!pickupLocation.trim() || !dropoffLocation.trim()) {
      toast.error("Please enter both pickup and dropoff locations.");
      return;
    }

    const rideDeparture = parseISO(ride.departureTime);
    if (isBefore(rideDeparture, new Date())) {
      toast.error("This ride has already departed and cannot be booked.");
      return;
    }

    if (seatCount < 1 || seatCount > ride.availableSeats) {
      toast.error(`Please select a seat count between 1 and ${ride.availableSeats}`);
      return;
    }

    try {
      const geocodeURL = "https://api.openrouteservice.org/geocode/search";
      const apiKey = "5b3ce3597851110001cf62484eb817f85d3b4acd9d1a7e1fdf05d60c";

      const fetchCoords = async (loc) => {
        const res = await axios.get(geocodeURL, {
          params: {
            api_key: apiKey,
            text: loc,
            size: 1,
          },
        });
        const [lng, lat] = res.data.features[0].geometry.coordinates;
        return { lat, lng };
      };

      const pickupCoords = await fetchCoords(pickupLocation);
      const dropoffCoords = await fetchCoords(dropoffLocation);

      const isPickupValid = isPointNearPolyline(pickupCoords, decodedPath);
      const isDropoffValid = isPointNearPolyline(dropoffCoords, decodedPath);

      if (!isPickupValid || !isDropoffValid) {
        toast.error("Pickup or Dropoff location must be along the ride route.");
        return;
      }

      const dist = await getDistanceInKm(pickupLocation, dropoffLocation);
      const farePerPerson = (dist * ride.payPerKm).toFixed(2);
      const totalFare = (farePerPerson * seatCount).toFixed(2);

      navigate("/payment", {
        state: {
          rideId: ride._id,
          userId: user.id,
          pickupLocation,
          dropoffLocation,
          payPerKm: ride.payPerKm,
          fare: totalFare,
          distance: dist.toFixed(2),
          seatCount,
        },
      });
    } catch (err) {
      toast.error("Could not verify location or calculate distance.");
      console.error(err);
    }
  };

  const handleChatClick = () => {
    if (!user || !ride?.driver?._id) return;

    const senderRole = isDriver ? "driver" : "user";
    const senderId = user.id;
    const driverId = ride.driver._id;
    const userId = !isDriver ? user.id : ride.passengers.find(p => p.user?._id)?.user._id;

    navigate(`/chat`, {
      state: {
        rideId: ride._id,
        userId,
        driverId,
        senderRole,
        senderId,
      },
    });
  };

  if (loading) return <div className="ride-loading">Loading ride details...</div>;
  if (error) return <div className="ride-error">Error: {error}</div>;
  if (!ride) return <div className="ride-error">Ride not found</div>;

  const isPassenger = ride.passengers.some(
    (passenger) => passenger.user?._id === user?.id
  );
  const isRideInPast = isBefore(parseISO(ride.departureTime), new Date());

  return (
    <div className="ride-container">
      <div className="ride-card">
        <div className="ride-header">
          <div>
            <h1>{ride.startLocation} → {ride.endLocation}</h1>
            <p>{format(parseISO(ride.departureTime), "PPPPp")}</p>
          </div>
          <span className="seats-badge">
            {ride.availableSeats} seat{ride.availableSeats !== 1 ? "s" : ""} available
          </span>
        </div>

        <div className="ride-details">
          <div>
            <h2>Driver Information</h2>
            <div className="ride-info">
              <p><strong>Name:</strong> {ride.driver?.user?.name}</p>
              <p><strong>Phone Number:</strong> {ride.driver?.user?.phone}</p>
              <p><strong>Car Model:</strong> {ride.driver?.carModel}</p>
              <p><strong>Car Color:</strong> {ride.driver?.carColor}</p>
            </div>
            {!isDriver && ride.driver?.user?.phone && (
              <div className="chat-buttons">
                <a
                  href={`https://wa.me/91${ride.driver.user.phone}?text=Hello%2C%20I%20have%20a%20question%20about%20the%20ride%20from%20${ride.startLocation}%20to%20${ride.endLocation}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <i className="fa-brands fa-whatsapp"></i> Chat On WhatsApp
                </a>
                <button onClick={handleChatClick} className="passenger-chat-btn">
                  <i className="fa-solid fa-comments"></i> Talk
                </button>
              </div>
            )}
          </div>

          <div>
            <h2>Ride Details</h2>
            <div className="ride-info">
              <p><strong>Departure:</strong> {ride.startLocation}</p>
              <p><strong>Destination:</strong> {ride.endLocation}</p>
              <p><strong>Price per Kilometer:</strong> ₹{ride.payPerKm}</p>
              <p><strong>Status:</strong> {ride.status}</p>
            </div>
          </div>
        </div>

        {ride.passengers.length > 0 && (
          <div className="ride-passengers">
            <h2>Passengers</h2>
            {ride.passengers.map((passenger, index) => (
              <div key={index} className="ride-passenger">
                <div>
                  <p>{passenger.user?.name || "Unknown"}</p>
                  <p className="ride-subtext">
                    {passenger.pickupLocation} → {passenger.dropoffLocation}
                  </p>
                </div>
                <span className="ride-subtext">{passenger.status}</span>
              </div>
            ))}
          </div>
        )}

        <div className="ride-actions">
          {!isDriver && !isPassenger && ride.availableSeats > 0 && !isRideInPast && (
            <>
              <div className="location-inputs">
                <label>
                  Pickup Location:
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Enter pickup location"
                  />
                </label>

                <label>
                  Dropoff Location:
                  <input
                    type="text"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    placeholder="Enter dropoff location"
                  />
                </label>

              <label>
  Number of Seats:
  <select
    value={seatCount}
    onChange={(e) => setSeatCount(Number(e.target.value))}
    required
  >
    <option value="">Select seat count</option>
    {Array.from({ length: ride.availableSeats }, (_, i) => i + 1).map((seat) => (
      <option key={seat} value={seat}>
        {seat}
      </option>
    ))}
  </select>
</label>

              </div>

              <button onClick={handleBookRide} className="book-btn">
                Book This Ride
              </button>
            </>
          )}

          {isRideInPast && <div className="booked-status">This ride has already departed.</div>}
          {isPassenger && <span className="booked-status">You're booked on this ride</span>}
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <MapContainer center={mapCenter} zoom={9} style={{ height: "450px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {pickupMarker && <Marker position={pickupMarker} />}
          {dropoffMarker && <Marker position={dropoffMarker} />}
          {decodedPath.length > 0 && <LeafletPolyline positions={decodedPath} color="blue" />}
        </MapContainer>
      </div>
    </div>
  );
};

export default RideDetails;
