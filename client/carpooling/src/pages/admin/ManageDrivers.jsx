import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiUserCheck, FiUserX, FiDollarSign, FiInfo } from 'react-icons/fi';
import './manage.css';

const ManageDrivers = () => {
  const formatDate = (isoDate) => {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

  const [allDrivers, setAllDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterApproved, setFilterApproved] = useState('all');
  const [walletEntries, setWalletEntries] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0
  });
  const limit = 10;

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/drivers');
        setAllDrivers(data.data || []);
        
        // Calculate stats
        const total = data.data.length;
        const approved = data.data.filter(d => d.approved).length;
        setStats({
          total,
          approved,
          pending: total - approved
        });
      } catch (error) {
        toast.error('Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };

    const fetchWallet = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/chat/admin-wallet', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setWalletEntries(data.data || []);
      } catch (error) {
        toast.error('Failed to load admin wallet data');
      }
    };

    fetchDrivers();
    fetchWallet();
  }, []);

  useEffect(() => {
    let filtered = [...allDrivers];

    if (filterApproved !== 'all') {
      filtered = filtered.filter((driver) =>
        filterApproved === 'approved' ? driver.approved : !driver.approved
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (driver) =>
          (driver.user?.name?.toLowerCase().includes(term)) ||
          (driver.user?.email?.toLowerCase().includes(term)) ||
          (driver.licenseNumber?.toLowerCase().includes(term)) ||
          (driver.carModel?.toLowerCase().includes(term)) ||
          (driver.plateNumber?.toLowerCase().includes(term))
      );
    }

    setFilteredDrivers(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterApproved, allDrivers]);

  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );
  const totalPages = Math.ceil(filteredDrivers.length / limit);

  const handleApprove = async (driverId) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/drivers/${driverId}/approve`);
      setAllDrivers((prev) =>
        prev.map((driver) =>
          driver._id === driverId ? { ...driver, approved: true } : driver
        )
      );
      setStats(prev => ({
        ...prev,
        approved: prev.approved + 1,
        pending: prev.pending - 1
      }));
      toast.success('Driver approved successfully');
    } catch (error) {
      toast.error('Failed to approve driver');
    }
  };

  const handleReject = async (driverId) => {
    try {
      await axios.put(`http://localhost:5000/api/v1/drivers/${driverId}/reject`);
      setAllDrivers((prev) =>
        prev.filter((driver) => driver._id !== driverId)
      );
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        total: prev.total - 1
      }));
      toast.success('Driver rejected successfully');
    } catch (error) {
      toast.error('Failed to reject driver');
    }
  };

  if (loading) return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <p>Loading drivers data...</p>
    </div>
  );

  return (
    <div className="dashboard">
       <div className="admin-heading">
        <h1>Admin Dashboard</h1>
      </div>
      <div className="dashboard-header">
        <h2>Driver Management</h2>
        <p className="dashboard-subtitle">Manage and monitor all registered drivers</p>
      </div>

      <div className="stats-container">
        <div className="stat-card total">
          <h3>Total Drivers</h3>
          <p>{stats.total}</p>
          <FiUserCheck className="stat-icon" />
        </div>
        <div className="stat-card approved">
          <h3>Approved</h3>
          <p>{stats.approved}</p>
          <FiUserCheck className="stat-icon" />
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p>{stats.pending}</p>
          <FiUserX className="stat-icon" />
        </div>
        <div className="stat-card revenue">
          <h3>Total Revenue</h3>
          <p>₹{walletEntries.reduce((sum, entry) => sum + (entry.share || 0), 0)}</p>
          <FiDollarSign className="stat-icon" />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Driver List</h2>
          <div className="controls">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-dropdown">
              <FiFilter className="filter-icon" />
              <select value={filterApproved} onChange={(e) => setFilterApproved(e.target.value)}>
                <option value="all">All Drivers</option>
                <option value="approved">Approved Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="drivers-table">
            <thead>
              <tr>
                <th>Driver Info</th>
                <th>License</th>
                <th>Vehicle Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDrivers.length > 0 ? (
                paginatedDrivers.map((driver) => (
                  <tr key={driver._id}>
                    <td>
                      <div className="driver-info">
                        <div className="driver-avatar">
                          {driver.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{driver.user?.name}</strong>
                          <div className="sub">{driver.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="license-info">
                        {driver.licenseNumber}
                        {/* <span className="sub">Expires: {driver.licenseExpiry || 'N/A'}</span> */}
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        <strong>{driver.carModel}</strong>
                        <div className="sub">
                          {driver.carColor} • {driver.plateNumber}
                        </div>
                      </div>
                    </td>
                    <td>
                      {driver.approved ? (
                        <span className="status-badge approved">
                          <FiUserCheck /> Approved
                        </span>
                      ) : (
                        <span className="status-badge pending">
                          <FiInfo /> Pending
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin-driver/${driver._id}`} className="view-btn">
                          Details
                        </Link>
                        {!driver.approved && (
                          <>
                            <button 
                              className="approve-btn"
                              onClick={() => handleApprove(driver._id)}
                            >
                              Approve
                            </button>
                            <button 
                              className="reject-btn"
                              onClick={() => handleReject(driver._id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <div className="no-data">
                      <FiInfo className="no-data-icon" />
                      <p>No drivers found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <div className="pagination-info">
            Showing {paginatedDrivers.length} of {filteredDrivers.length} drivers
          </div>
          <div className="pagination-controls">
            <button 
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <FiChevronLeft /> Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Revenue Dashboard</h2>
          <div className="revenue-summary">
            <span>Total Earnings: ₹{walletEntries.reduce((sum, entry) => sum + (entry.share || 0), 0)}</span>
          </div>
        </div>
        <div className="table-responsive">
          <table className="wallet-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User ID</th>
                <th>Ride ID</th>
                <th>Amount (₹)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {walletEntries.length > 0 ? (
                walletEntries.map((item, index) => (
                  <tr key={index}>
                    <td>TRX-{item._id?.slice(-6).toUpperCase()}</td>
                    <td>{item.userId}</td>
                    <td>{item.rideId}</td>
                    <td className="amount">₹{item.share}</td>
                   <td>{item.createdAt ? formatDate(item.createdAt) : 'N/A'}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <div className="no-data">
                      <FiInfo className="no-data-icon" />
                      <p>No wallet transactions yet</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageDrivers;