import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import "./style.css"

const MyRides = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchRides = async () => {
      try {
        let endpoint = 'http://localhost:5000/api/v1/rides';
        if (user?.role === 'driver') {
          endpoint = 'http://localhost:5000/api/v1/rides';
        }

        const { data } = await api.get(endpoint);
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

  const filteredRides = rides.filter((ride) => {
    const departure = new Date(ride.departureTime);
    const now = new Date();
    if (activeTab === 'upcoming') {
      return departure > now;
    } else if (activeTab === 'past') {
      return departure <= now;
    }
    return true;
  });

  if (loading) return <div className="myrides-container"><p>Loading your rides...</p></div>;
  if (error) return <div className="myrides-container error"><p>Error: {error}</p></div>;

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
                  <h2>{ride.startLocation} → {ride.endLocation}</h2>
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
                  <p className="label">Price</p>
                  <p>${ride.pricePerSeat}</p>
                </div>
                <div>
                  <p className="label">Seats</p>
                  <p>{ride.availableSeats} / {ride.passengers.length}</p>
                </div>
              </div>

              <div className="ride-footer">
                <Link to={`/rides/${ride._id}`} className="details-link">
                  View details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRides;
