import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './manage.css';

const ManageDrivers = () => {
  const [allDrivers, setAllDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterApproved, setFilterApproved] = useState('all');
  const [walletEntries, setWalletEntries] = useState([]);
  const limit = 10;

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/drivers');
        setAllDrivers(data.data || []);
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
          driver.user?.name?.toLowerCase().includes(term) ||
          driver.user?.email?.toLowerCase().includes(term) ||
          driver.licenseNumber?.toLowerCase().includes(term) ||
          driver.carModel?.toLowerCase().includes(term) ||
          driver.plateNumber?.toLowerCase().includes(term)
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
      toast.success('Driver approved successfully');
    } catch (error) {
      toast.error('Failed to approve driver');
    }
  };

  if (loading) return <div className="loader">Loading drivers...</div>;

  return (
    <div className="dashboard">
      <div className="header">
        <h2>Manage Drivers</h2>
        <div className="filters">
          <select value={filterApproved} onChange={(e) => setFilterApproved(e.target.value)}>
            <option value="all">All Drivers</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
          </select>
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>License</th>
              <th>Car Details</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Verify</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDrivers.map((driver) => (
              <tr key={driver._id}>
                <td>
                  <strong>{driver.user?.name}</strong>
                  <div className="sub">{driver.user?.email}</div>
                </td>
                <td>{driver.licenseNumber}</td>
                <td>
                  {driver.carModel} ({driver.carColor})<br />
                  <span className="sub">{driver.plateNumber}</span>
                </td>
                <td>
                  {driver.approved ? (
                    <span className="status approved">Approved</span>
                  ) : (
                    <span className="status pending">Pending</span>
                  )}
                </td>
                <td>
                  <Link to={`/admin-driver/${driver._id}`} className="view-link">
                    View
                  </Link>
                </td>
                <td>
                  {!driver.approved ? (
                    <button className="btn-approve" onClick={() => handleApprove(driver._id)}>
                      Approve
                    </button>
                  ) : (
                    <span className="verified">✔ Verified</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDrivers.length === 0 && <p className="no-data">No drivers found</p>}
      </div>

      <div className="pagination">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <div className="wallet-container">
        <h3>Admin Wallet</h3>
        <table className="wallet-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Ride ID</th>
              <th>Share (₹)</th>
            </tr>
          </thead>
          <tbody>
            {walletEntries.length > 0 ? (
              walletEntries.map((item, index) => (
                <tr key={index}>
                  <td>{item.userId}</td>
                  <td>{item.rideId}</td>
                  <td>₹{item.share}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">No wallet entries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageDrivers;
