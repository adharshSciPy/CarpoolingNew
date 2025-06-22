import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';
import './style.css';

const MyRides = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Fetch rides
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const { data } = await api.get('/rides'); // adjust base URL if needed
        setRides(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching rides');
        toast.error('Failed to fetch your rides');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [user]);

  // ⏰ Auto-refresh UI every 30 seconds to check ride time
  useEffect(() => {
    const interval = setInterval(() => {
      setRides((prev) => [...prev]); // trigger re-render
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter rides by time and active tab
  const filteredRides = rides.filter((ride) => {
    const departure = new Date(ride.departureTime);
    const now = new Date();
    return activeTab === 'upcoming' ? departure > now : departure <= now;
  });

  const handleSubmitReview = async (driverId, rideId) => {
    try {
      await api.post(`/drivers/${driverId}/review`, {
        rideId,
        rating,
        feedback,
      });
      toast.success('Review submitted!');
      setShowReviewForm(null);
      setRating(0);
      setFeedback('');
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div className="myrides-container">
      <header className="header">
        <h1>My Rides</h1>
        <div className="tabs">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={activeTab === 'upcoming' ? 'tab active' : 'tab'}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={activeTab === 'past' ? 'tab active' : 'tab'}
          >
            Past
          </button>
        </div>
      </header>

      {filteredRides.length === 0 ? (
        <div className="empty-state">
          <p>
            You have no {activeTab} rides.{' '}
            {user?.role === 'driver' && activeTab === 'upcoming' && (
              <Link to="/driver/create-ride" className="create-link">
                Create a new ride
              </Link>
            )}
          </p>
        </div>
      ) : (
        <div className="rides-list">
          {filteredRides.map((ride) => (
            <div key={ride._id} className="ride-card">
              <div className="ride-header">
                <div>
                  <h2>
                    {ride.startLocation} → {ride.endLocation}
                  </h2>
                  <p>{format(parseISO(ride.departureTime), 'PPPPp')}</p>
                </div>
                <span className={`status status-${ride.status}`}>
                  {ride.status}
                </span>
              </div>

              <div className="ride-info">
                <div>
                  <p className="label">Role</p>
                  <p>{ride.driver?.user?._id === user?.id ? 'Driver' : 'Passenger'}</p>
                </div>
                <div>
                  <p className="label">Fare</p>
                  <p>
                    ₹
                    {ride.passengers.find((p) => p.user?._id === user?.id)?.fare?.toFixed(2) ||
                      (ride.payPerKm ? `${ride.payPerKm} per km` : 'N/A')}
                  </p>
                </div>
               <div>
  <p className="label">Seats</p>
  <p>
    Booked: {ride.passengers.length} / Available: {ride.availableSeats}
  </p>
</div>

              </div>

              <div className="ride-footer">
                <Link to={`/rides/${ride._id}`} className="details-link">
                  View details →
                </Link>
              </div>

              {/* Review Section (Only for past rides and passengers) */}
              {activeTab === 'past' && user?.role !== 'driver' && (
                <>
                  <button
                    onClick={() => setShowReviewForm(ride._id)}
                    className="review-btn"
                  >
                    Review Driver
                  </button>

                  {showReviewForm === ride._id && (
                    <div className="modal-overlay">
                      <div className="modal">
                        <h3>Rate the Driver</h3>
                        <div className="stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              size={24}
                              color={star <= rating ? '#ffc107' : '#e4e5e9'}
                              onClick={() => setRating(star)}
                              style={{ cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                        <textarea
                          placeholder="Write your feedback"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                        <div className="modal-actions">
                          <button
                            onClick={() => handleSubmitReview(ride.driver._id, ride._id)}
                            className="submit-review"
                          >
                            Submit Review
                          </button>
                          <button
                            onClick={() => setShowReviewForm(null)}
                            className="cancel-review"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRides;
