import React from "react";
import "./ContactUs.css";

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-box">
        <h2 className="contact-heading">Contact Us</h2>
        <p className="contact-description">
          We'd love to hear from you. Please fill out the form below.
        </p>

        <form>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" placeholder="Your Name" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="Your Email" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <input type="text" id="message" placeholder="Write your message..." />
          </div>

          <button type="submit" className="submit-button">
            Send Message
          </button>
        </form>

        <div className="contact-info-section">
          <div className="info-card">
            <span className="icon">📞</span>
            <div>
              <strong>Landline</strong>
              <br />
              +91 12345 67890
            </div>
          </div>
          <div className="info-card">
            <span className="icon">🏢</span>
            <div>
              <strong>Office</strong>
              <br />
              123 Main Street, City, India
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;