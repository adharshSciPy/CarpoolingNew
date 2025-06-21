import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './DriverDashboard.css';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profileResponse = await api.get('http://localhost:5000/api/v1/drivers');
        setDriverProfile(profileResponse.data.data.driverProfile);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-heading">Driver Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Rides</h3>
          <p className="stat-value">{driverProfile?.tripsCompleted || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Approval Status</h3>
          <p>
            <span className="badge badge-approved">Approved</span>
          </p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p className="stat-value">{driverProfile?.rating?.toFixed(1) || 'N/A'}</p>
        </div>
      </div>

      <div className="section">
        <h2>Quick Actions</h2>
        <div className="actions">
          <Link to="/driver/create-ride" className="btn-primary">Create New Ride</Link>
          <Link to="/profile" className="btn-outline">Update Profile</Link>
          <Link to="/my-rides" className="btn-outline">See My Rides</Link>
          <Link to="/chatlist" className="btn-outline">Chats</Link>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
