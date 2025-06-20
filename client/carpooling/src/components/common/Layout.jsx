import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import "./Layout.css";
import Footer from "../footer/Footer";

const Layout = () => {
  const { user, logout } = useAuth();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const getHomeLink = () => {
    if (role === "driver") return "/driver";
    return "/";
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <Link to={getHomeLink()} className="navbar-brand">
              DriveShare
            </Link>
            <div className="navbar-links">
              {role === "driver" && (
                <Link to="/" className="navbar-link">
                  Home
                </Link>
              )}
              {role !== "driver" && (
                <Link to="/rides" className="navbar-link">
                  Find Rides
                </Link>
              )}
              <Link to={getHomeLink()} className="navbar-link active">
                DashBoard
              </Link>
            </div>
          </div>
          <div className="navbar-right">
            {user ? (
              <div className="auth-links">
                <Link to="/profile" className="auth-link">
                  Profile
                </Link>
                <button onClick={logout} className="auth-link logout">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="auth-link">
                  Login
                </Link>
                <Link to="/register" className="auth-link">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="main-container">
          <Outlet />
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default Layout;
