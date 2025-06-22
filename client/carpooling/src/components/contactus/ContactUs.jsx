import React from "react";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <div className="contact-container">
      <div className="contact-box">
        <h2 className="contact-heading">Contact Us</h2>
        <p className="contact-description">
          We'd love to hear from you. Fill out the form or reach us through the details below.
        </p>

        {/* Name & Username Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" placeholder="Enter your name" />
          </div>
          <div className="form-group">
            <label htmlFor="username">E-mail</label>
            <input type="text" id="username" placeholder="Enter your mail ID" />
          </div>
        </div>

        {/* Contact Info */}
        <div className="contact-info-section">
          <div className="info-card">
            <div className="icon">📞</div>
            <div>
              <h4>Landline</h4>
              <p>+91 67278567367</p>
            </div>
          </div>
          <div className="info-card">
            <div className="icon">🏢</div>
            <div>
              <h4>Office</h4>
              <p>123, Anna Salai, Chennai, India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
