import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './View.css';
// import axios from 'axios';

const labels = [
  "CITC",
  "COT",
  "CSTE",
  "COM",
  "CSM",
  "CEA",
  "SHS",
  "IGIS",
  "OTHERS"
];

const programs = {
    CITC: [
      "B.S. in Computer Science", 
      "B.S. in Data Science", 
      "B.S. in Information Technology", 
      "B.S. in Technology Communication Management", 
      "M.S. in Technology Communication Management", 
      "Master in Information Technology"
    ],
    COT: [
      "B.S. in Electro-Mechanical Technology", 
      "Bachelor of Science in Autotronics (BSAt)", 
      "Bachelor of Science in Electro-Mechanical Technology (IA)", 
      "Bachelor of Science in Electro-Mechanical Technology (MR)", 
      "Bachelor of Science in Electronics Technology (ES)", 
      "Bachelor of Science in Electronics Technology (MST)", 
      "Bachelor of Science in Electronics Technology (TN)", 
      "Bachelor of Science in Energy Systems and Management(EMCM) ", 
      "Bachelor of Science in Energy Systems and Management(PSDE)", 
      "Bachelor of Science in Manufacturing Engineering Technology", 
      "BACHELOR OF TECHNOLOGY, OPERATIONS, AND MANAGEMENT", 
      "Master in Industrial Technology and Operations"
    ],
    CSTE: [
      "Bachelor in Technical-Vocational Teacher Education", 
      "Bachelor of Secondary Education", 
      "Bachelor of Secondary Education Major in  Science", 
      "Bachelor of Technology and Livelihood Education-he", 
      "Bachelor of Technology and Livelihood Education-IA", 
      "Certificate of Teaching", 
      "Doctor in Technology Education", 
      "Doctor of Philosophy  in Mathematics Education", 
      "Doctor of Philosophy in Educational Planning and Administration", 
      "Doctor of Philosophy in Science Education", 
      "M.A. in Teaching English as a Second Language", 
      "M.A. in Teaching Special Education", 
      "M.S. in Teaching Physical Sciences(Physics)", 
      "Master in Education Planning & Management", 
      "Master in Technician Teacher Education",
      "Master in Technician Teacher Education-ALL", 
      "Master of Science in Education Planning and Administration", 
      "Master of Science in Mathematics Education", 
      "Master of Science in Science Education", 
      "Master of Technical and Technology Education", 
      "MS in Science Education(Chemistry)", 
      "MS in Teaching Mathematics", 
      "PH.D in Science Education(Chemistry)"
    ],
    COM: ["Medicine"],
    CSM: [
      "B.S. in Applied Mathematics", 
      "B.S. in Chemistry", 
      "Bachelor of Science in Applied Physics", 
      "Bachelor of Science in Environmental Science", 
      "Bachelor of Science in Environmental Science(EMT)", 
      "	Bachelor of Science in Environmental Science(NRM)", 
      "Bachelor of Science in Food Technology", 
      "Doctor of Philosophy in Applied Mathematics", 
      "M.S. Applied Mathematical Sciences", 
      "M.S. in Environmental Science & Technology", 
      "Master of Science in Environmental Science", 
      "PH.D. in Mathematical Sciences(Applied Mathematical Sciences)"
    ],
    CEA: [
      "B.S. in Architecture", 
      "B.S. in Civil Engineering", 
      "B.S. in Computer Engineering - CEA", 
      "B.S. in Electrical Engineering", 
      "B.S. in Electronics Engineering", 
      "B.S. in Geodetic Engineering", 
      "B.S. in Mechanical Engineering", 
      "Doctor of Philosophy in Energy Engineering",
      "Master of Engineering - Civil Engineering",
      "Master of Engineering - Electronics Engineering",
      "Master of Engineering - Mechanical Engineering", 
      "Master of Engineering Program", 
      "Master of Science in Electrical Engineering", 
      "Master of Science in Sustainable Development", 
      "Professional Science Master in Power System Engineering and Management"
    ],
    IGIS: ["Master in Public Sector Innovation"], 
    SHS: ["Senior High School-STEM"],   
    OTHERS: ["Employees", "Visitors"]
};

  const View = () => {
  const [logs, setLogs] = useState([]);
  const [currentCollege, setCurrentCollege] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPrograms, setCurrentPrograms] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const [currentProgram, setCurrentProgram] = useState(null); // Track the selected program


  const [showLogoutModal, setShowLogoutModal] = useState(false); // State for modal visibility
  const navigate = useNavigate(); // To redirect the user

  const handleBackClick = async () => {
    setCurrentCollege(null); // Reset the college view
    setCurrentPrograms(null); // Reset the programs list
    setCurrentProgram(null); // Reset the selected program
    setLogs([]); // Clear the logs
  
    // Keep the previously selected date, do not reset it to today's date
    const dateToFetch = selectedDate; // Preserve the selected date
    
    try {
      const response = await fetch(`http://localhost:8000/api/logs/date?date=${dateToFetch}`);
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs); // Fetch and display logs for the selected date
      } else {
        console.error("Failed to fetch logs.");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]); // Clear logs in case of an error
    }
  };
  

  const handleLogoutClick = () => {
    setShowLogoutModal(true); // Show logout confirmation modal
  };

  const handleLogoutConfirm = () => {
    // Optional: Clear user session or data
    localStorage.removeItem('user'); // Example: Remove user data if it's stored in localStorage
    navigate('/'); // Redirect to main or login page
    setShowLogoutModal(false); // Close the modal
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false); // Close the modal without logging out
  };

  const fetchLogsByParams = async (endpoint, params = {}) => {
    try {
      const url = new URL(`http://localhost:8000/api/${endpoint}`);
      Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        return data.logs || [];
      }
      return [];
    } catch (error) {
      console.error(`Error fetching logs from ${endpoint}:`, error);
      return [];
    }
  };

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-CA'); // Default to today's date
    setSelectedDate(formattedDate); // Set as default in the date picker
  
    const fetchInitialLogs = async () => {
      const logs = await fetchLogsByParams("logs/date", { date: formattedDate });
      setLogs(logs);
    };
  
    fetchInitialLogs();
  }, []);

  const handleClick = async (type) => {
    const today = selectedDate; // Use the selectedDate state (even if it's not today's date)
  
    try {
      if (Object.keys(programs).includes(type) && type !== 'OTHERS') {
        // Fetch logs for the selected college
        const response = await fetch(`http://localhost:8000/api/logs/college/${type}?date=${today}`);
        const data = await response.json();
  
        if (data.success) {
          setLogs(data.logs); // Update logs for the college and selected date
          setCurrentCollege(type); // Update current college
          setCurrentPrograms(programs[type]); // Set available programs for the selected college
        } else {
          console.error("Failed to fetch college logs", data.error);
        }
      } else if (type === 'OTHERS') {
        // Fetch logs for visitors and employees for the selected date
        const visitorResponse = await fetch(`http://localhost:8000/api/logs/visitor?date=${today}`);
        const visitorData = await visitorResponse.json();
        
        const employeeResponse = await fetch(`http://localhost:8000/api/logs/employee?date=${today}`);
        const employeeData = await employeeResponse.json();
  
        // Check if both responses were successful
        if (visitorData.success && employeeData.success) {
          // Combine visitor and employee logs
          const combinedLogs = [...visitorData.logs, ...employeeData.logs];
  
          if (combinedLogs.length > 0) {
            setLogs(combinedLogs); // Update logs only if there's data
          } else {
            setLogs([]); // Set empty logs if no data is available
            console.warn("No logs found for visitors and employees on the selected date.");
          }
  
          setCurrentCollege(type); // Set "OTHERS" as current college
          setCurrentPrograms(programs[type]); // Set "OTHERS" programs
        } else {
          console.error("Failed to fetch logs for visitors and employees", visitorData.error, employeeData.error);
        }
      } else {
        // Fetch all logs if no specific college is selected
        const response = await fetch(`http://localhost:8000/api/logs/date?date=${today}`);
        const data = await response.json();
        
        if (data.success) {
          if (data.logs.length > 0) {
            setLogs(data.logs); // Fetch logs for all colleges for the selected date
          } else {
            setLogs([]); // Set empty logs if no data is found
            console.warn("No logs found for the selected date.");
          }
        } else {
          console.error("Failed to fetch logs for all colleges", data.error);
        }
      }
    } catch (error) {
      console.error("Error in handleClick:", error); // Log any errors that occur
    }
  };  
  
  const handleProgramClick = async (course) => {
    const programType = course.toUpperCase();
    const today = selectedDate;  // Use the currently selected date
    setCurrentProgram(course); // Update the current program name
  
    if (programType === "VISITORS") {
      try {
        const response = await fetch(`http://localhost:8000/api/logs/visitor?date=${today}`);
        const data = await response.json();
        if (data.success) {
          setLogs(data.logs);
        } else {
          console.error('Failed to fetch visitor logs:', data.error);
        }
      } catch (error) {
        console.error('Error fetching logs for Visitors:', error);
      }
    } else if (programType === "EMPLOYEES") {
      try {
        const response = await fetch(`http://localhost:8000/api/logs/employee?date=${today}`);
        const data = await response.json();
        if (data.success) {
          setLogs(data.logs);
        } else {
          console.error('Failed to fetch employee logs:', data.error);
        }
      } catch (error) {
        console.error('Error fetching logs for Employees:', error);
      }
    } else {
      try {
        const response = await fetch(`http://localhost:8000/api/logs/college/program/${course}?date=${today}`);
        const data = await response.json();
        if (data.success) {
          setLogs(data.logs);
        } else {
          console.error('Failed to fetch program logs:', data.error);
        }
      } catch (error) {
        console.error('Error fetching program logs:', error);
      }
    }
  };  

  const handleDateChange = async (e) => {
    const date = e.target.value; // Get the selected date from the date picker
    setSelectedDate(date); // Update the selected date
  
    if (currentCollege) {
      // Fetch logs for the current college on the selected date
      const logs = await fetchLogsByParams(`logs/college/${currentCollege}`, { date });
      setLogs(logs);
    } else if (currentProgram) {
      // Fetch logs for the current program on the selected date
      const logs = await fetchLogsByParams(`logs/college/program/${currentProgram}`, { date });
      setLogs(logs);
    } else {
      // Fetch logs for all colleges on the selected date
      const logs = await fetchLogsByParams("logs/date", { date });
      setLogs(logs);
    }
  };  

  const handleSearchChange = async (e) => {
    const searchQuery = e.target.value;
    setSearchQuery(searchQuery); // Update the searchQuery state
  
    console.log("Search Query Sent:", searchQuery); // Log the query here for debugging
  
    if (!searchQuery) {
      setLogs([]); // Clear results if searchQuery is empty
      return;
    }
  
    setLoading(true);  // Set loading state to true when starting the search
  
    try {
      const isNumeric = !isNaN(searchQuery) || searchQuery.trim() === searchQuery; // Allow alphanumeric IDs
  
      let response;
      if (isNumeric) {
        response = await fetch(`http://localhost:8000/api/logs/id?id=${searchQuery}`);
      } else {
        response = await fetch(`http://localhost:8000/api/logs/name?name=${searchQuery}`);
      }
  
      if (!response.ok) {
        throw new Error('Failed to fetch logs. Please try again.');
      }
  
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      setError("Error fetching results. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="main-container2">
      {/* Left container for College Labels or Program List */}
      <div className="left-container2">
      <button class="generate-btn">Generate Records</button>
        <button className="logout-btn" onClick={handleLogoutClick}>Logout</button> {/* Logout button */}
        {currentCollege && (
          <div className="back-button-container" onClick={handleBackClick}>
            <span className="back-icon">←</span>
          </div>
        )}
        <div className={`grid-container ${currentPrograms ? 'programs-list' : ''}`}>
          {currentCollege ? (
            <>
              <h2 className="college-heading">{currentCollege + " DEPARTMENT"}</h2>
              {currentPrograms.map((program, index) => (
                <div key={index} className="program-box" onClick={() => handleProgramClick(program)}>
                  {program}
                </div>
              ))}
            </>
          ) : (
            labels.map((label, index) => (
              <div key={index} className="box" onClick={() => handleClick(label)}>
                {label}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right container for Logs and Search */}
      <div className="right-container2">
      <h2> {currentProgram ? `${currentProgram} LOG ENTRIES` : currentCollege ? `${currentCollege} LOG ENTRIES` : 'LOG ENTRIES'} </h2>


        {/* Search and Date Picker */}
        <div className="search-date-container">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by ID or Name"
            className="search-bar"
          />

          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}

          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-picker"
          />
        </div>

        {/* Logs Table */}
        <table className="logs-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Position/Program</th>
      <th>Year Level</th>
      <th>Log Type</th>
      <th>Time</th>
    </tr>
  </thead>
  <tbody>
    {logs.length > 0 ? (
      logs.map((log, index) => (
        <tr key={index}>
          <td>{log.Name[0]?.fullName || 'N/A'}</td>
          <td>{log.PositionOrProgram || 'N/A'}</td>
          <td>{log.yearLevel || ''}</td>
          <td>{log.LogType || 'N/A'}</td>
          <td>{log.LogTime[0]?.time || 'N/A'}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="5">No logs available for the selected college or program.</td>
      </tr>
    )}
  </tbody>
</table>
      </div>
        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Are you sure you want to logout?</h2>
            <button onClick={handleLogoutConfirm}>Yes</button>
            <button onClick={handleLogoutCancel}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default View;