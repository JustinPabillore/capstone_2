import React, { useState, useEffect } from 'react';
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

  const [submittedData, setSubmittedData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    purpose: '',
  });

  const [showQRCode, setShowQRCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const capitalizeFirstWord = (value) => {
    if (!value) return '';
    const words = value.split(' ');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const handleInputChange = (field, value) => {
    let capitalizedValue = value;

    if (field === 'firstName') {
      capitalizedValue = capitalizeFirstWord(value);
    } else if (field === 'address' || field === 'purpose'  || field === 'middleName' || field === 'lastName') {
      // Capitalize only if the first character is not already uppercase
      if (value.length > 0 && value[0] === value[0].toLowerCase()) {
        capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }

    setFormData({
      ...formData,
      [field]: capitalizedValue,
    });
  };

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

    // Capitalize each part of the submitted data
    const capitalizedData = {
      firstName: capitalizeFirstWord(formData.firstName),
      middleName: formData.middleName ? capitalizeFirstWord(formData.middleName) : '',
      lastName: capitalizeFirstWord(formData.lastName),
      address: capitalizeFirstWord(formData.address),
      purpose: capitalizeFirstWord(formData.purpose),
    };

    // Store the submitted data
    setSubmittedData(capitalizedData);

    setShowQRCode(true);
    setCountdown(30); // Start the countdown from 30 seconds

    // Clear form data after submission
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      address: '',
      purpose: '',
    });
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0 && showQRCode) {
      setShowQRCode(false);
    }
    return () => clearInterval(timer);
  }, [countdown, showQRCode]);

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
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required // Required attribute
              />
              <input
                type="text"
                className="input-fields"
                placeholder="Middle Name (Optional)"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
              />
              <input
                type="text"
                className="input-fields"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required // Required attribute
              />
              <input
                type="text"
                className="input-fields"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required // Required attribute
              />
              <input
                type="text"
                className="input-fields"
                placeholder="Purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
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
              <>
                <QRCode
                  value={`${submittedData.firstName} ${submittedData.middleName} ${submittedData.lastName}`}
                  size={250}
                />
                <div className="notice">
                  <p>This code will expire in {countdown} seconds.</p>
                </div>
                <div className="notice2">
                  <p>PLEASE TAKE A PICTURE AND USE IT TO</p>
                  <p>ENTER AND EXIT THE CAMPUS. THANK YOU!</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;
