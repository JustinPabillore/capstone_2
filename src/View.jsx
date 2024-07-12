import React from 'react';
import './View.css';

const labels = [
  "CITC",
  "COT",
  "CSTE",
  "COM",
  "CSM",
  "CEA",
  "SHS",
  "EMPLOYEE",
  "VISITOR"
];

const View = () => {
  
  const handleClick = (label) => {
    alert(`Clicked on ${label}`);
    console.log('Button Pressed');
    // Add your logic for what happens when a box is clicked
  };

  return (
    <div className="main-container2">
      <div className="left-container2">
        <div className="grid-container">
          {labels.map((label, index) => (
            <div key={index} className="box" onClick={() => handleClick(label)}>
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="right-container2">
      </div>
    </div>
  );
};

export default View;