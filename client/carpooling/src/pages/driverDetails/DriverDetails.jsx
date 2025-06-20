import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import "./driverDetails.css";

const DriverDetails = () => {
  const { id } = useParams(); // driverId from URL
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    carModel: "",
    carColor: "",
    licenseNumber: "",
  });

  const fetchDriver = async () => {
    try {
      const { data } = await api.get(`/drivers/${id}`);
      setDriver(data.data);
      setForm({
        carModel: data.data.carModel || "",
        carColor: data.data.carColor || "",
        licenseNumber: data.data.licenseNumber || "",
      });
    } catch (err) {
      toast.error("Failed to fetch driver details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const handleToggleApproval = async () => {
    try {
      const { data } = await api.put(`/drivers/${id}/approval`);
      setDriver(data.driver);
      toast.success(`Driver ${data.driver.approved ? "enabled" : "disabled"} successfully!`);
    } catch (err) {
      toast.error("Failed to toggle driver status.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/drivers/${id}`, form);
      toast.success("Driver updated successfully!");
      setDriver(data.data);
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update driver.");
    }
  };

  if (loading) return <div className="driver-loading">Loading driver data...</div>;
  if (!driver) return <div className="driver-error">Driver not found.</div>;

  return (
    <div className="driver-container">
      <h2>Driver Details</h2>
      <div className="driver-card">
        <p><strong>Name:</strong> {driver.user?.name}</p>
        <p><strong>Email:</strong> {driver.user?.email}</p>
        <p><strong>Phone:</strong> {driver.user?.phone}</p>
        <p><strong>Car Model:</strong> {driver.carModel}</p>
        <p><strong>Car Color:</strong> {driver.carColor}</p>
        <p><strong>License Number:</strong> {driver.licenseNumber}</p>
        <p><strong>Status:</strong> {driver.approved ? "✅ Approved" : "❌ Not Approved"}</p>
      </div>

      <button
        className={`btn-approve ${driver.approved ? "bg-red-600" : "bg-green-600"}`}
        onClick={handleToggleApproval}
      >
        {driver.approved ? "Disable Driver" : "Approve Driver"}
      </button>

      <button
        className="btn-edit-toggle"
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? "Cancel Edit" : "Edit Driver Info"}
      </button>

      {isEditing && (
        <form className="driver-form" onSubmit={handleUpdate}>
          <label>
            Car Model:
            <input
              type="text"
              value={form.carModel}
              onChange={(e) => setForm({ ...form, carModel: e.target.value })}
            />
          </label>
          <label>
            Car Color:
            <input
              type="text"
              value={form.carColor}
              onChange={(e) => setForm({ ...form, carColor: e.target.value })}
            />
          </label>
          <label>
            License Number:
            <input
              type="text"
              value={form.licenseNumber}
              onChange={(e) =>
                setForm({ ...form, licenseNumber: e.target.value })
              }
            />
          </label>
          <button type="submit" className="btn-update">Update Driver</button>
        </form>
      )}
    </div>
  );
};

export default DriverDetails;
