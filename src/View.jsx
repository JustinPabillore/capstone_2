import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Define courses for each label
const courses = {
  CITC: [
    "BS Computer Science",
    "BS Data Science",
    "BS Information Technology",
    "BS Technology Communication Management",
    "M.S Technology Communications Management",
    "Master in Information Technology"
  ],
  COT: [
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
  ],
  CSTE: [
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
  ],
  // ... Add remaining labels and their respective courses
  COM: ["Medicine"],
  CSM: [
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
  ],
  CEA: [
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
  ],
  IGIS: ["Master in Public Sector Innovation"],
  SHS: ["Senior High School - STEM"],
  EMPLOYEES: ["Employees"],
  VISITORS: ["Visitors"]
};

const View = () => {
  const navigate = useNavigate();
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [logs, setLogs] = useState([]);
  const courseListRef = useRef(null);

  const handleLabelClick = (label) => {
    setSelectedLabel(courses[label] || []);
    setSelectedCourse(null); // Reset course selection
    setLogs([]); // Clear logs when a new label is selected
    if (courseListRef.current) courseListRef.current.scrollTop = 0;
  };

  const handleCourseClick = async (course) => {
    setSelectedCourse(course); // Set selected course to display logs for this course
    try {
      const response = await fetch(`http://localhost:8000/api/logs/course/${course}`);
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs); // Update logs with specific course data
      }
    } catch (error) {
      console.error('Error fetching course logs:', error);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="main-container2">
      <div className="left-container2">
        <div className="grid-container">
          {labels.map((label, index) => (
            <div
              key={index}
              className={`box ${label === "VISITORS" ? "visitor-box" : ""}`}
              onClick={() => handleLabelClick(label)}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="right-container2" ref={courseListRef}>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
        
        {/* Show list of courses if a label is selected and no course is yet selected */}
        {selectedLabel && !selectedCourse && (
          <div className="course-list">
            <h3>Courses</h3>
            <ul>
              {selectedLabel.map((course, index) => (
                <li key={index} onClick={() => handleCourseClick(course)}>
                  {course}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Show log table if a course is selected */}
        {selectedCourse && (
          <div>
            <h2>Log Entries for {selectedCourse}</h2>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position/Program</th>
                  <th>Year Level</th>
                  <th>Log Type</th>
                  <th>Log Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.Name}</td>
                    <td>{log.PositionOrProgram || 'N/A'}</td>
                    <td>{log.YearLevel || ''}</td>
                    <td>{log.LogType}</td>
                    <td>{new Date(log.LogTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* <button onClick={() => setSelectedCourse(null)}>Back to Courses</button> */}
          </div>
        )}
        
        <button className="generate-record-button">Generate Record</button>
      </div>
    </div>
  );
};

export default View;
