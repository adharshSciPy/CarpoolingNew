import "./Payment.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { rideId, pickupLocation, dropoffLocation, pricePerSeat } = location.state || {};

  const [paymentDetails, setPaymentDetails] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rideId || !pickupLocation || !dropoffLocation || !pricePerSeat) {
      toast.error("Booking information is missing.");
      return;
    }

    setLoading(true);

    try {
      // Fake payment validation logic here
      // You can add more validation if needed

      // Simulate payment processed
      toast.info("Processing payment...");

      // Booking API call
      const { data } = await api.post(`/rides/${rideId}/book`, {
        pickupLocation,
        dropoffLocation,
      });

      toast.success("Payment & Booking successful!");
      setBookingData({
        pickupLocation,
        dropoffLocation,
        pricePerSeat,
        status: data?.status || "Confirmed",
      });

      // Optionally redirect after some time
      setTimeout(() => {
        navigate("/my-rides"); // or any post-booking route
      }, 5000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h2 className="payment-title">Enter Payment Details</h2>

      {!bookingData ? (
        <form className="payment-form" onSubmit={handleSubmit}>
          <label>
            Cardholder Name
            <input
              type="text"
              name="name"
              value={paymentDetails.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Card Number
            <input
              type="text"
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={handleChange}
              maxLength="16"
              required
            />
          </label>

          <div className="form-row">
            <label>
              Expiry Date
              <input
                type="text"
                name="expiry"
                value={paymentDetails.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                required
              />
            </label>

            <label>
              CVV
              <input
                type="password"
                name="cvv"
                value={paymentDetails.cvv}
                onChange={handleChange}
                maxLength="3"
                required
              />
            </label>
          </div>

          <button type="submit" className="btn-pay" disabled={loading}>
            {loading ? "Processing..." : `Pay ₹${pricePerSeat}`}
          </button>
        </form>
      ) : (
        <div className="booking-confirmation">
          <h3>Booking Confirmed!</h3>
          <p>
            <strong>From:</strong> {bookingData.pickupLocation}
          </p>
          <p>
            <strong>To:</strong> {bookingData.dropoffLocation}
          </p>
          <p>
            <strong>Amount Paid:</strong> ${bookingData.pricePerSeat}
          </p>
          <p>
            <strong>Status:</strong> {bookingData.status}
          </p>
          <p>You will be redirected shortly...</p>
        </div>
      )}
    </div>
  );
};

export default Payment;
