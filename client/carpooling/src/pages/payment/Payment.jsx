import "./Payment.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    rideId,
    pickupLocation,
    dropoffLocation,
    fare,
    userId,
    seatCount,
  } = location.state || {};

  const [paymentDetails, setPaymentDetails] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const numericFare = parseFloat(fare);
  const commission = isNaN(numericFare)
    ? 0
    : (numericFare * 0.002).toFixed(2); // 0.2%
  const total = isNaN(numericFare)
    ? 0
    : (numericFare + parseFloat(commission)).toFixed(2);

  const handleChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !rideId ||
      !pickupLocation ||
      !dropoffLocation ||
      !fare ||
      !userId ||
      !seatCount
    ) {
      toast.error("Booking information is incomplete.");
      return;
    }

    setLoading(true);

    try {
      toast.info("Processing payment...");

      const { data } = await api.post(`/rides/${rideId}/book/${userId}`, {
        pickupLocation,
        dropoffLocation,
        fare: numericFare,
        seatCount,
      });

      toast.success("Payment & Booking successful!");
      setBookingData({
        pickupLocation,
        dropoffLocation,
        fare: numericFare.toFixed(2),
        commission,
        total,
        seatCount,
        status: data?.message || "Confirmed",
      });

      setTimeout(() => {
        navigate("/my-rides");
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

          <div className="fare-breakdown">
            <p>
              <strong>Seat(s):</strong> {seatCount}
            </p>
            <p>
              <strong>Base Fare:</strong> ₹{numericFare.toFixed(2)}
            </p>
            <p>
              <strong>Processing Fee (0.2%):</strong> ₹{commission}
            </p>
            <p>
              <strong>Total:</strong> ₹{total}
            </p>
          </div>

          <button type="submit" className="btn-pay" disabled={loading}>
            {loading ? "Processing..." : `Pay ₹${total}`}
          </button>
        </form>
      ) : (
        <div className="booking-confirmation">
          <div className="success-icon">✅</div>
          <h3>Payment Successful!</h3>
          <p className="thank-you-msg">Thank you for your booking.</p>

          <div className="confirmation-details">
            <p><strong>From:</strong> {bookingData.pickupLocation}</p>
            <p><strong>To:</strong> {bookingData.dropoffLocation}</p>
            <p><strong>Seat(s):</strong> {bookingData.seatCount}</p>
            <p><strong>Base Fare:</strong> ₹{bookingData.fare}</p>
            <p><strong>Processing Fee:</strong> ₹{bookingData.commission}</p>
            <p><strong>Total Paid:</strong> ₹{bookingData.total}</p>
            <p><strong>Status:</strong> {bookingData.status}</p>
          </div>

          <p className="redirect-msg">
            You will be redirected to <strong>My Rides</strong> shortly...
          </p>
        </div>
      )}
    </div>
  );
};

export default Payment;
