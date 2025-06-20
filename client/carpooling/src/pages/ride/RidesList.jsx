import { useEffect, useState } from 'react';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';
import RideCard from '../../components/ride/RideCard';
import './style.css'; 

const RidesList = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const { data } = await api.get('/rides');
        setRides(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching rides');
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  if (loading) return <div className="status-msg">Loading rides...</div>;
  if (error) return <div className="status-msg error">Error: {error}</div>;

  return (
    <div className="rides-container">
      <h1 className="title">Available Rides</h1>

      <div className="rides-grid">
        {rides.length > 0 ? (
          rides.map((ride) => (
            <RideCard
              key={ride._id}
              id={ride._id}
              from={ride.startLocation}
              to={ride.endLocation}
              date={format(parseISO(ride.departureTime), 'PPP')}
              time={format(parseISO(ride.departureTime), 'p')}
              seats={ride.availableSeats}
              price={ride.pricePerSeat}
              driverName={ride.driver?.user?.name}
              carModel={ride.driver?.carModel}
            />
          ))
        ) : (
          <div className="no-rides-msg">
            <p>No rides available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RidesList;
