import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { format, parseISO, isBefore } from "date-fns";
import { toast } from "react-toastify";
import getDistanceInKm from "../../utils.js";
import "./style.css";

const RideDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");

  const isDriver = localStorage.getItem("role") === "driver";

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const { data } = await api.get(`/rides/${id}`);
        setRide(data.data);
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

    try {
      const dist = await getDistanceInKm(pickupLocation, dropoffLocation);
      const fare = (dist * ride.payPerKm).toFixed(2);

      navigate("/payment", {
        state: {
          rideId: ride._id,
          userId: user.id,
          pickupLocation,
          dropoffLocation,
          payPerKm: ride.payPerKm,
          fare,
          distance: dist.toFixed(2),
        },
      });
    } catch (err) {
      toast.error("Could not calculate distance.");
    }
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
              <div className="whatsapp-btn">
                <a
                  href={`https://wa.me/91${ride.driver.user.phone}?text=Hello%2C%20I%20have%20a%20question%20about%20the%20ride%20from%20${ride.startLocation}%20to%20${ride.endLocation}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-whatsapp"></i> Chat with Driver
                </a>
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
              </div>

              <button
                onClick={handleBookRide}
                className="book-btn"
              >
                Book This Ride
              </button>
            </>
          )}

          {isRideInPast && (
            <div className="booked-status">This ride has already departed.</div>
          )}

          {isPassenger && (
            <span className="booked-status">You're booked on this ride</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideDetails;
