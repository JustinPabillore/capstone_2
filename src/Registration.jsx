// Registration.jsx
import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import './Registration.css';

function Registration() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    purpose: '',
  });

  const [showQRCode, setShowQRCode] = useState(false);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    
    // Check if all required fields are filled
    if (
      formData.firstName.trim() === '' ||
      formData.lastName.trim() === '' ||
      formData.address.trim() === '' ||
      formData.purpose.trim() === ''
    ) {
      alert('Please fill out all required fields.');
      return;
    }

    setShowQRCode(true);

    // Clear form data after submission
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      address: '',
      purpose: '',
    });

    // Hide QR code after 5 seconds
    setTimeout(() => {
      setShowQRCode(false);
    }, 15000);
  };

  return (
    <div className="main-container3">
      <div className="top-container1">
        <label className="main-title">VISITOR REGISTRATION</label>
      </div>
      <div className="mid1-container">
        <span className="mid1-text">
          UNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES MONITORING SYSTEM
        </span>
      </div>
      <div className="bottom-container">
        <div className="left-container">
          <div className="m-box">
            <div className="m-box-title">REGISTER</div>
            <form className="form" onSubmit={handleFormSubmit}>
              <input
                type="text"
                className="input-fields"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required // Required attribute
              />
              <input
                type="text"
                className="input-fields"
                placeholder="Middle Name (Optional)"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
              <input
                type="text"
                className="input-fields"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required // Required attribute
              />
              <input
                type="text"
                className="input-fields"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required // Required attribute
              />
              <input
                type="text"
                className="input-fields"
                placeholder="Purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                required // Required attribute
              />
              <button type="submit" className="r-submit-button">
                Submit
              </button>
            </form>
          </div>
        </div>
        <div className="right-container">
          <div className="m-box">
            <div className="m-box-title">QR CODE</div>
            {showQRCode && (
              <QRCode
                value={`${formData.firstName} ${formData.middleName} ${formData.lastName}`}
                size={250}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;
