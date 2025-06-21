import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import "./manage.css"

const ManageDrivers = () => {
  const [allDrivers, setAllDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterApproved, setFilterApproved] = useState('all');

  const limit = 10;

  // Fetch all drivers once
  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/drivers`);
        setAllDrivers(data.data || []);
      } catch (error) {
        toast.error('Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // Apply frontend filtering
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
    setCurrentPage(1); // Reset to page 1 after filter
  }, [searchTerm, filterApproved, allDrivers]);

  // Paginate filtered results
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

  if (loading) return <div className="p-4">Loading drivers...</div>;

  const wallet = [
    { User: "Userone", Ride: "Rideone", Share: "Shareohne" },
    { User: "Usertwo", Ride: "Ridetwo", Share: "Shareotwo" },
    { User: "Userthree", Ride: "Ridethree", Share: "Sharethree" },
    { User: "Userfour", Ride: "Ridefour", Share: "Sharefour" },
    { User: "Userfive", Ride: "Ridefive", Share: "Sharefive" }
  ]

  return (
    <div className="admin">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Drivers</h2>
        <div className="flex space-x-4">
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={filterApproved}
            onChange={(e) => setFilterApproved(e.target.value)}
          >
            <option value="all">All Drivers</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
          </select>
          <input
            type="text"
            placeholder="Search drivers..."
            className="border border-gray-300 rounded-md px-3 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">License</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Car Details</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Verify</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedDrivers.map((driver) => (
              <tr key={driver._id}>
                <td className="px-6 py-4">
                  <div className="font-medium">{driver.user?.name}</div>
                  <div className="text-sm text-gray-500">{driver.user?.email}</div>
                </td>
                <td className="px-6 py-4 text-sm">{driver.licenseNumber}</td>
                <td className="px-6 py-4 text-sm">
                  {driver.carModel} ({driver.carColor})<br />
                  <span className="text-gray-500">{driver.plateNumber}</span>
                </td>
                <td className="px-6 py-4">
                  {driver.approved ? (
                    <span className="inline-block px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                      Approved
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs text-yellow-800 bg-yellow-100 rounded-full">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/admin-driver/${driver._id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </Link>
                </td>
                <td className="px-6 py-4">
                  {!driver.approved ? (
                    <button
                      onClick={() => handleApprove(driver._id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-green-600 text-sm">✔ Verified</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-8 text-gray-500">No drivers found</div>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="wallet-container">
        <h2 className="wallet-title">Wallet Table</h2>
        <table className="wallet-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Ride</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {wallet.map((item, index) => (
              <tr key={index}>
                <td>{item.User}</td>
                <td>{item.Ride}</td>
                <td>{item.Share}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageDrivers;
