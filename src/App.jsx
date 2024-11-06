import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import './App.css';

function LogDisplay() {
  const [logEntries, setLogEntries] = useState([]); // Initialize log entries array

  useEffect(() => {
    const fetchLogs = async () => {
      try {
          const response = await fetch('/api/logs');
          
          // Check if response is JSON
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
              const textResponse = await response.text(); // Read response as text
              console.error("Received non-JSON response from /api/logs:", textResponse); // Log the full response text
              return;
          }
  
          const data = await response.json();
          const newLog = data.logs[0]; // Assuming API returns logs array sorted by most recent
          updateLogEntries(newLog);
          
      } catch (error) {
          console.error("Error fetching logs:", error);
      }
  };
  
  

    // Fetch logs every X seconds
    const interval = setInterval(fetchLogs, 5000); // Adjust interval as needed
    return () => clearInterval(interval);
}, []);


  const updateLogEntries = (newLog) => {
      // Add new log at the beginning, keep array within 5 entries
      setLogEntries((prevEntries) => {
          const updatedEntries = [newLog, ...prevEntries];
          return updatedEntries.slice(0, 5); // Limit to 5 entries
      });
  };

  return (
      <div className="log-container">
          {logEntries.map((log, index) => (
              <LogBox key={index} log={log} />
          ))}
      </div>
  );
}

// Individual log box
function LogBox({ log }) {
  const isStudent = !log.Position;
  const logTypeStyle = log.LogType === "Time In" ? { color: 'green' } : { color: 'red' };

  return (
      <div className="log-box">
          <p>Name: {log.Name}</p>
          {isStudent ? (
              <>
                  <p>Year Level: {log.YearLevel}</p>
                  <p>Program: {log.Program}</p>
              </>
          ) : (
              <p>Position: {log.Position}</p>
          )}
          <p>Log Time: {log.LogTime}</p>
          <p style={logTypeStyle}>Log Type: {log.LogType}</p>
      </div>
  );
}

// State to hold the logs for the 4 boxes
let logs = [null, null, null, null]; // Initialize with nulls for 4 boxes

function updateBoxes(newLog) {
    // Shift current logs down by one position and add new log at the front
    logs = [newLog, ...logs.slice(0, 3)];
}

// Fetch new log and update display
function fetchAndUpdateLogs() {
    fetch('/api/logs') // Adjust API endpoint as needed
        .then(response => response.json())
        .then(data => {
            if (data.logs && data.logs.length > 0) {
                const newLog = data.logs[0]; // Take the most recent log from backend

                // Apply the display conditions for student or non-student
                if (newLog.Position === 'Student') {
                    newLog.display = {
                        name: newLog.Name,
                        detail1: `Year: ${newLog.YearLevel}`,
                        detail2: `Program: ${newLog.Program}`,
                        time: newLog.LogTime,
                        type: newLog.LogType,
                    };
                } else {
                    newLog.display = {
                        name: newLog.Name,
                        detail1: `Position: ${newLog.Position}`,
                        time: newLog.LogTime,
                        type: newLog.LogType,
                    };
                }

                updateBoxes(newLog);
                renderBoxes(); // Update the UI with the new state
            }
        })
        .catch(error => console.error('Error fetching logs:', error));
}

// Function to render boxes in the frontend
function renderBoxes() {
    logs.forEach((log, index) => {
        const box = document.getElementById(`box-${index + 1}`);
        if (log) {
            box.innerHTML = `
                <div><strong>${log.display.name}</strong></div>
                <div>${log.display.detail1}</div>
                ${log.display.detail2 ? `<div>${log.display.detail2}</div>` : ""}
                <div>${log.display.time}</div>
                <div style="color: ${log.display.type === 'Time In' ? 'green' : 'red'};">
                    ${log.display.type}
                </div>
            `;
        } else {
            box.innerHTML = ''; // Clear the box if no log is assigned
        }
    });
}

// Start the initial fetch and set an interval for updates
fetchAndUpdateLogs();
setInterval(fetchAndUpdateLogs, 5000); // Fetch every 5 seconds


function App() {
  const [counts, setCounts] = useState({
    CITC: 0,
    COT: 0,
    CSTE: 0,
    COM: 0,
    CSM: 0,
    CEA: 0,
    SHS: 0,
    EMPLOYEE: 0,
    VISITOR: 0,
    TOTAL: 0, // Total count based on Time In minus Time Out
  });

  const [totalIn, setTotalIn] = useState(0); // New state for total Time In
  const [totalOut, setTotalOut] = useState(0); // New state for total Time Out

  useEffect(() => {
    fetchCounts(); 
    fetchTotalVisitors(); 
    fetchTotalEntry(); 
    fetchTotalExit();
  }, []);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [nameInput1, setNameInput1] = useState(''); // For Time In
  const [nameInput2, setNameInput2] = useState(''); // For Time Out

  const navigate = useNavigate();

  const fetchTotalVisitors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/logs/count');
      if (!response.ok) {
        throw new Error(`Error fetching total visitors: ${response.statusText}`);
      }
      const data = await response.json();
      
      const total = Number(data.totalRemaining);
      setCounts((prevCounts) => ({
        ...prevCounts,
        TOTAL: !isNaN(total) ? total : 0,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCounts = async () => {
    const colleges = ['CITC', 'COT', 'CSTE', 'COM', 'CSM', 'CEA', 'SHS'];
    const positions = ['VISITOR', 'EMPLOYEE']; // Add Visitor and Employee positions here

    try {
        const counts = await Promise.all([
            ...colleges.map(async (college) => {
                const response = await fetch(`http://localhost:8000/api/logs/count/${college}`);
                if (!response.ok) throw new Error(`Error fetching ${college} count: ${response.statusText}`);
                const data = await response.json();
                console.log(`Fetched count for ${college}:`, data);
                return { key: college, count: Number(data.totalRemaining) };
            }),
            ...positions.map(async (position) => {
                const response = await fetch(`http://localhost:8000/api/logs/count/${position}`);
                if (!response.ok) throw new Error(`Error fetching ${position} count: ${response.statusText}`);
                const data = await response.json();
                console.log(`Fetched count for ${position}:`, data);
                return { key: position, count: Number(data.totalRemaining) };
            })
        ]);

        const countsObject = counts.reduce((acc, { key, count }) => {
            acc[key] = !isNaN(count) ? count : 0;
            return acc;
        }, {});

        setCounts((prevCounts) => ({ ...prevCounts, ...countsObject }));
    } catch (error) {
        console.error(error);
    }
};


  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      setShowLoginModal(false);
      setLoginError('');
      navigate('/view');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setLoginError('');
    setShowLoginModal(false);
  };

  const handleTimeInSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/timein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput1, logType: "Time In" }), // Include logType
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }

      const result = await response.json();
      if (result.success) {
        alert('Visitor data successfully logged as Time In.');
        setNameInput1(''); // Clear input after successful submission
        setTotalIn((prev) => prev + 1); // Increment total Time In
        fetchTotalVisitors(); // Update total count after successful submission
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while logging data: ' + error.message);
    }
  };

  const handleTimeOutSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/timeout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput2, logType: "Time Out" }), // Include logType
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }

      const result = await response.json();
      if (result.success) {
        alert('Visitor Time Out successfully logged.');
        setNameInput2(''); // Clear input after successful submission
        setTotalOut((prev) => prev + 1); // Increment total Time Out
        fetchTotalVisitors(); // Update total count after successful submission
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while logging Time Out: ' + error.message);
    }
  };

  const fetchTotalEntry = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/logs/count/timein');
        const data = await response.json();
        setTotalIn(data.totalEntry || 0); // Update Total Entry
    } catch (error) {
        console.error('Error fetching Total Entry:', error);
    }
};

const fetchTotalExit = async () => {
    try {
        const response = await fetch('http://localhost:8000/api/logs/count/timeout');
        const data = await response.json();
        setTotalOut(data.totalExit || 0); // Update Total Exit
    } catch (error) {
        console.error('Error fetching Total Exit:', error);
    }
};

  return (
    <div className="main-container">
      <div className="top-container">
        {Object.keys(counts).map((key) => (
          <div className="box1" key={key}>
            <label className="box1-label">{key}</label>
            <span className="box1-count">{counts[key]}</span>
          </div>
        ))}
      </div>
      <div className="mid1-container">
        <span className="mid1-text">UNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES MONITORING SYSTEM</span>
      </div>
      <div className="mid2-container">
        <div id="box-1" div className="box2"></div>
        <div id="box-2" div className="box2"></div>
        <div id="box-3" div className="box2"></div>
        <div id="box-4" div className="box2"></div>
        <div id="box-5" div className="box2">        
          <input
            type="text"
            value={nameInput1}
            onChange={(e) => setNameInput1(e.target.value)}
            placeholder="Enter Name"
            className="b1"
          />
          <button onClick={handleTimeInSubmit}>Time In</button>

          <input
            type="text"
            value={nameInput2}
            onChange={(e) => setNameInput2(e.target.value)}
            placeholder="Enter Name"
            className="b1"
          />
          <button onClick={handleTimeOutSubmit}>Time Out</button>
        </div>
      </div>
      <div className="bottom-container">
        <div className="bottom-left">Total Entry: {totalIn}</div>
        <div className="bottom-middle">Total Exit: {totalOut}</div>
        <div className="bottom-right">
          <button className="view-records-btn" onClick={() => setShowLoginModal(true)}>View Records</button>
        </div>
      </div>

      {showLoginModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-title">ADMIN LOGIN</h2>
            <label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
            </label>
            <label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </label>
            {loginError && <p className="error">{loginError}</p>}
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
