import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Get role from localStorage (e.g., 'driver' or 'user')
  const role = localStorage.getItem("role");

  return (
    <div className="home-container">
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span>Share Rides,</span>
            <span className="highlight">Save the Planet</span>
          </h1>
          <p className="hero-subtext">
            Join our carpooling community to reduce costs, traffic, and carbon
            emissions.
          </p>
          <div className="hero-buttons">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn-primary">
                  Get started
                </Link>
                <Link to="/rides" className="btn-secondary">
                  Browse rides
                </Link>
              </>
            ) : role === "driver" ? (
              <Link to="/driver/create-ride" className="btn-primary">
                Offer a Ride
              </Link>
            ) : (
              <>
                <Link to="/rides" className="btn-primary">
                  Find a Ride
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="features-header">
          <h2 className="features-tagline">Why DriveShare?</h2>
          <p className="features-title">Benefits for everyone</p>
        </div>
        <div className="features-grid">
          {[
            {
              name: "Save Money",
              description:
                "Split the cost of gas and tolls with fellow travelers, making your commute more affordable.",
              icon: "💰",
            },
            {
              name: "Reduce Traffic",
              description:
                "Fewer cars on the road means less congestion and shorter commute times for everyone.",
              icon: "🚗",
            },
            {
              name: "Eco-Friendly",
              description:
                "Cut down on carbon emissions by sharing rides and reducing your environmental impact.",
              icon: "🌱",
            },
            {
              name: "Meet People",
              description:
                "Connect with neighbors and coworkers who share your commute route.",
              icon: "👥",
            },
            {
              name: "Less Stress",
              description:
                "Share driving responsibilities and enjoy a more relaxed commute.",
              icon: "😌",
            },
            {
              name: "Flexible Options",
              description:
                "Choose from one-time rides or regular commuting partners that fit your schedule.",
              icon: "⏱️",
            },
          ].map((feature) => (
            <div key={feature.name} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <div>
                <h3 className="feature-name">{feature.name}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default Home;
