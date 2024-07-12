import React from 'react';
import './Registration.css';

function Registration() {
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
          <div className="box">
            <div className="box-title">REGISTER</div>
            <form className="form">
              <input type="text" className="input-fields" placeholder="Field 1" />
              <input type="text" className="input-fields" placeholder="Field 2" />
              <input type="text" className="input-fields" placeholder="Field 3" />
              <input type="text" className="input-fields" placeholder="Field 4" />
              <input type="text" className="input-fields" placeholder="Field 5" />
              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div>
        </div>
        <div className="right-container">
          {/* Add content for the right container here */}
        </div>
      </div>
    </div>
  );
}

export default Registration;
