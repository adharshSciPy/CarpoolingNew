import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiLock, FiMail } from "react-icons/fi";
import { toast } from "react-toastify";
import "./adminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/v1/admin/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("role", "admin");
      toast.success("Login successful");
      navigate("/admin-dash");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Admin Portal</h1>
          <p>Sign in to access the dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="button-loader"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Having trouble? <a href="/support">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;