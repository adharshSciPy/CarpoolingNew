import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import "./footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <h4 className="footer-head-4">Top carpool routes</h4>
          <ul>
            <li>Delhi → Chandigarh</li>
            <li>Mumbai → Pune</li>
            {/* <li>Kanpur → Lucknow</li>
            <li>Bengaluru → Chennai</li>
            <li>Pune → Mumbai</li> */}
            <li>All carpool routes</li>
            <li>All carpool destinations</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-head-4">About</h4>
          <ul>
            <li>How It Works</li>
            <li>About Us</li>
            <li>Help Centre</li>
            {/* <li>Press</li>
            <li>We’re Hiring!</li> */}
          </ul>
        </div>
          <div className="footer-column">
        <p className="footer-head-4">Terms and Conditions</p>
        <div className="footer-bottom-right">
          <div className="footer-social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedinIn /></a>
            <a href="#"><FaInstagram /></a>
          </div>
          <span className="footer-language">🌐 Language</span>
        </div>
      </div>
      </div>

    
    </footer>
  );
};

export default Footer;
