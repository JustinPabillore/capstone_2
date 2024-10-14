import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './View.css';

const labels = [
  "CITC",
  "COT",
  "CSTE",
  "COM",
  "CSM",
  "CEA",
  "IGIS",
  "SHS",
  "EMPLOYEES",
  "VISITORS"
];

// CITC Courses
const citcCourses = [
  "BS Computer Science",
  "BS Data Science",
  "BS Information Technology",
  "BS Technology Communication Management",
  "M.S Technology Communications Management",
  "Master in Information Technology"
];

// COT Courses
const cotCourses = [
  "BS Electro-Mechanical Technology",
  "BS Autotronics (BSAt)",
  "BS Electro-Mechanical Technology (IA)",
  "BS Electro-Mechanical Technology (MR)",
  "BS Electronics Technology (ES)",
  "BS Electronics Technology (MST)",
  "BS Electronics Technology (TN)",
  "BS Energy Systems and Management (EMCM)",
  "BS Energy Systems and Management (PSDE)",
  "BS Manufacturing Engineering Technology",
  "Bachelor of Technology, Operation, and Management",
  "Master in Industrial Technology and Operations"
];

// CSTE Courses
const csteCourses = [
  "Bachelor in Technical-Vocational Teacher Education",
  "Bachelor of Secondary Education",
  "Bachelor of Secondary Education Major in Science",
  "Bachelor of Technology and Livelihood Education-he",
  "Bachelor of Technology and Livelihood Education-IA",
  "Certificate of Teaching",
  "Doctor in Technology Education",
  "Doctor of Philosophy in Mathematics Education",
  "Doctor of Philosophy in Educational Planning and Administration",
  "Doctor of Philosophy in Science Education",
  "M.A in Teaching English as a Second Language",
  "M.A in Teaching Special Education",
  "M.S in Teaching Physical Science (Physics)",
  "Master in Education Planning & Management",
  "Master in Technician Teacher Education",
  "Master in Technician Teacher Education - ALL",
  "Master of Science in Education Planning and Administration",
  "Master of Science in Mathematics Education",
  "Master of Science in Science Education",
  "Master of Technical and Technology Education",
  "MS in Science Education(Chemistry)",
  "MS in Teaching Mathematics",
  "PH.D in Science Education(Chemistry)"
];

// COM Courses
const comCourses = [
  "Medicine"
];

// CSM Courses
const csmCourses = [
  "BS Applied Mathematics",
  "BS Chemistry",
  "BS Applied Physics",
  "BS Environmental Science",
  "BS Environmental Science (EMT)",
  "BS Environmental Science (NRM)",
  "BS Food Technology",
  "Doctor of Philosophy in Applied Mathematics",
  "M.S Applied Mathematical Sciences",
  "M.S Environmental Science and Technology",
  "Master of Science in Applied Mathematics",
  "Master of Science in Environmental Science",
  "PH.D in Mathematical Science(Applied Mathematical Sciences)"
];

// CEA Courses
const ceaCourses = [
  "BS Architecture",
  "BS Civil Engineering",
  "BS Computer Engineering",
  "BS Electrical Engineering",
  "BS Electronics Engineering",
  "BS Geodetic Engineering",
  "BS Mechanical Engineering",
  "Doctor of Philosophy in Energy Engineering",
  "Master of Engineering - Civil Engineering",
  "Master of Engineering - Mechanical Engineering",
  "Master of Engineering Program",
  "Master of Science in Electrical Engineering",
  "Master of Science in Sustainable Development",
  "Professional Science Master in Power System Engineering and Management"
];

// IGIS Courses
const igisCourses = [
  "Master in Public Sector Innovation"
];

// SHS
const shsStrand = [
  "Senior High School - STEM"
];

// Employee
const employees = [
  "Employees"
];

// Visitors
const visitors = [
  "Visitors"
];

const View = () => {
  const navigate = useNavigate(); // Create a navigate function
  const [selectedLabel, setSelectedLabel] = useState(null);
  const courseListRef = useRef(null); // Create a reference for the course list

  const handleClick = (label) => {
    console.log('Button Pressed:', label);
    let courses = null;

    // Set courses based on the selected label
    if (label === "CITC") {
      courses = citcCourses;
    } else if (label === "COT") {
      courses = cotCourses;
    } else if (label === "CSTE") {
      courses = csteCourses;
    } else if (label === "COM") {
      courses = comCourses;
    } else if (label === "CSM") {
      courses = csmCourses;
    } else if (label === "CEA") {
      courses = ceaCourses;
    } else if (label === "IGIS") {
      courses = igisCourses;
    } else if (label === "SHS") {
      courses = shsStrand;
    } else if (label === "EMPLOYEES") {
      courses = employees;
    } else if (label === "VISITORS") {
      courses = visitors;
    } else {
      courses = null;
    }

    setSelectedLabel(courses);
    if (courseListRef.current) {
      courseListRef.current.scrollTop = 0;
    }
  };

  const handleLogout = () => {
    navigate('/'); // Navigate back to the main app (App.jsx)
  };

  const handleGenerateRecord = () => {
    // Add your record generation logic here
    console.log("Generate Record button clicked");
  };

  return (
    <div className="main-container2">
      <div className="left-container2">
        <div className="grid-container">
          {labels.map((label, index) => (
            <div
              key={index}
              className={`box ${label === "VISITORS" ? "visitor-box" : ""}`}
              onClick={() => handleClick(label)}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="right-container2" ref={courseListRef}>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
        {selectedLabel && (
          <div className="course-list">
            <h3>
              {selectedLabel === citcCourses ? "CITC" :
               selectedLabel === cotCourses ? "COT" :
               selectedLabel === csteCourses ? "CSTE" :
               selectedLabel === comCourses ? "COM" :
               selectedLabel === csmCourses ? "CSM" :
               selectedLabel === ceaCourses ? "CEA" :
               selectedLabel === igisCourses ? "IGIS" :
               selectedLabel === shsStrand ? "SHS" :
               selectedLabel === employees ? "EMPLOYEES" :
               "VISITORS"}
            </h3>
            <ul>
              {selectedLabel.map((course, index) => (
                <li key={index}>
                  {course} - 0
                </li>
              ))}
            </ul>
          </div>
        )}
        <button className="generate-record-button" onClick={handleGenerateRecord}>Generate Record</button>
      </div>
    </div>
  );
};

export default View;
