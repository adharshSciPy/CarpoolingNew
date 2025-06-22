import { useEffect, useState } from 'react';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';
import RideCard from '../../components/ride/RideCard';
import { FiSearch, FiX } from 'react-icons/fi';
import './style.css';

const RidesList = () => {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startSearch, setStartSearch] = useState('');
  const [endSearch, setEndSearch] = useState('');

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/rides');
      setRides(data.data);
      setFilteredRides(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSearch = () => {
    if (!startSearch.trim() && !endSearch.trim()) {
      setFilteredRides(rides);
      return;
    }

    const filtered = rides.filter((ride) => {
      const startMatch = ride.startLocation
        .toLowerCase()
        .includes(startSearch.toLowerCase());
      const endMatch = ride.endLocation
        .toLowerCase()
        .includes(endSearch.toLowerCase());
      return startMatch && endMatch;
    });

    setFilteredRides(filtered);
  };

  const handleClear = () => {
    setStartSearch('');
    setEndSearch('');
    setFilteredRides(rides);
  };

  if (loading) return <div className="status-msg">Loading rides...</div>;
  if (error) return <div className="status-msg error">Error: {error}</div>;

 return (
  <div className="rides-container">
    <h1 className="title">Available Rides</h1>

    <div className="search-bar-wrapper">
      <div className="search-bar">
        <input
          type="text"
          placeholder="From"
          value={startSearch}
          onChange={(e) => setStartSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <input
          type="text"
          placeholder="To"
          value={endSearch}
          onChange={(e) => setEndSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-btn" onClick={handleSearch} title="Search">
          <FiSearch className="search-icon" />
        </button>
        <button className="clear-btn" onClick={handleClear} title="Clear">
          <FiX className="clear-icon" />
        </button>
      </div>
    </div>

    <div className="rides-grid">
      {filteredRides.length > 0 ? (
        filteredRides.map((ride) => (
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
          <p>No rides found for the given locations.</p>
        </div>
      )}
    </div>
  </div>
);

};

export default RidesList;