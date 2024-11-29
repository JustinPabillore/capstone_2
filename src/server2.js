const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 8000;

// Use express's built-in JSON parser
app.use(express.json());
app.use(cors());

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',  // Fill in your MySQL password if applicable
    database: 'capstone'
};

// Establish MySQL connection
const connection = mysql.createConnection(dbConfig);

connection.connect(error => {
    if (error) {
        console.error('Database connection failed: ', error.stack);
        return;
    }
    console.log('Connected to the database.');
}); 

app.post('/api/updateLogType', (req, res) => {
    const { name, logType } = req.body;

    // Update LogType in ustpdata table
    const updateLogTypeQuery = `
    UPDATE ustpdata
    SET LogType = ?
    WHERE Name = ? AND (LogType IS NULL OR LogType = 'Time Out')`;

    connection.query(updateLogTypeQuery, [logType, name], (err, results) => {
    if (err) {
        console.error('Error updating LogType:', err);
        return res.status(500).json({ success: false, error: 'Error updating LogType' });
    }

    res.json({ success: true });
    });
});

// Register route
app.post('/api/register', (req, res) => {
    const { firstName, middleName, lastName, address, purpose } = req.body;

    // Log received data for debugging
    console.log('Received data:', { firstName, middleName, lastName, address, purpose });

    // Validation checks
    if (!firstName || !lastName || !address || !purpose) {
        console.log('Validation error: Missing fields');
        return res.status(400).json({ success: false, error: 'Please fill out all required fields.' });
    }

    if (address.length < 5) {
        console.log('Validation error: Address too short');
        return res.status(400).json({ success: false, error: 'Address must be at least 5 characters.' });
    }

    if (purpose.length < 3) {
        console.log('Validation error: Purpose too short');
        return res.status(400).json({ success: false, error: 'Purpose must be at least 3 characters.' });
    }

    const middleInitial = middleName ? middleName.charAt(0).toUpperCase() : '';

    // Prepare the SQL query
    const sql = 'INSERT INTO ustpdata (firstName, middleInitial, lastName, Position, Purpose, Address) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [firstName, middleInitial, lastName, 'Visitor', purpose, address];

    // Execute the SQL query
    connection.query(sql, values, (err, results) => {
        if (err) {
            console.error('Database query error: ', err);
            return res.status(500).json({ success: false, error: 'Database error', details: err.message });
        }

        // Successfully inserted data
        res.json({ success: true, message: 'Data successfully inserted.' });
    });
});

const moment = require('moment');  // Ensure you have moment.js installed for easy date formatting

app.get('/api/logs', (req, res) => {
    const { idNumber, firstName, lastName } = req.query;

    let query = `
        SELECT 
            IDNumber,
            firstName,
            middleInitial,
            lastName,
            CASE 
                WHEN Position = 'Student' THEN Program 
                ELSE Position 
            END AS PositionOrProgram,
            yearLevel,
            LogType, 
            LogTime 
        FROM ustplogs
    `;

    let queryParams = [];

    if (idNumber || (firstName && lastName)) {
        query += ' WHERE ';

        if (idNumber) {
            query += 'IDNumber LIKE ? ';
            queryParams.push(`%${idNumber}%`);
        }

        if (firstName && lastName) {
            if (queryParams.length > 0) {
                query += 'AND ';
            }
            query += 'firstName = ? AND lastName = ? ';
            queryParams.push(firstName, lastName);
        }
    }

    query += ' ORDER BY LogTime DESC';

    connection.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching logs:', err);
            return res.status(500).json({ success: false, error: 'Error fetching logs data' });
        }

        // Format results
        const formattedLogs = results.map(row => {
            // Build fullName with middle initial if available
            let fullName = `${row.firstName}`;
            if (row.middleInitial) {
                fullName += ` ${row.middleInitial.trim()}.`;
            }
            fullName += ` ${row.lastName}`;

            return {
                IDNumber: row.IDNumber,
                Name: [
                    {
                        fullName: fullName.trim(),
                        firstName: row.firstName,
                        middleInitial: row.middleInitial ? row.middleInitial.trim() : "",
                        lastName: row.lastName
                    }
                ],
                PositionOrProgram: row.PositionOrProgram,
                yearLevel: row.yearLevel,
                LogType: row.LogType,
                LogTime: [
                    {
                        date: new Date(row.LogTime).toDateString(),
                        time: new Date(row.LogTime).toLocaleTimeString()
                    }
                ]
            };
        });

        res.json({ success: true, logs: formattedLogs });
    });
});

app.get('/api/logs', (req, res) => {
    const { idNumber, firstName, lastName } = req.query;

    let query = `
    SELECT 
        IDNumber,
        firstName,
        middleInitial,
        lastName, 
        CASE 
            WHEN Position = 'Student' THEN Program 
            ELSE Position 
        END AS PositionOrProgram,
        yearLevel,
        LogType, 
        LogTime 
    FROM ustplogs
    `;

    let queryParams = [];

    // Add conditions for filtering by IDNumber or name
    if (idNumber || (firstName && lastName)) {
    query += ' WHERE ';

    if (idNumber) {
        query += 'IDNumber LIKE ? ';
        queryParams.push(`%${idNumber}%`);
    }

    if (firstName && lastName) {
        if (queryParams.length > 0) {
        query += 'AND ';
        }
        query += 'firstName = ? AND lastName = ? ';
        queryParams.push(firstName, lastName);
    }
    }

    query += ' ORDER BY LogTime DESC';

    connection.query(query, queryParams, (err, results) => {
    if (err) {
        console.error('Error fetching logs:', err);
        return res.status(500).json({ success: false, error: 'Error fetching logs data' });
    }

    // Modify the results to match the desired structure
    const modifiedResults = results.map(log => {
        const logDate = new Date(log.LogTime);

        // Format date and time
        const formattedDate = moment(logDate).format('ddd MMM DD YYYY');
        const formattedTime = moment(logDate).format('h:mm:ss A');

        const logTimeFormatted = {
        date: formattedDate,
        time: formattedTime
        };

        // Construct FullName based on middleInitial presence
        const fullNameString = log.middleInitial 
        ? `${log.firstName} ${log.middleInitial.trim()}. ${log.lastName}` 
        : `${log.firstName} ${log.lastName}`;

        // Create FullName as an array of objects
        const fullName = [{
        fullName: fullNameString,
        firstName: log.firstName,
        middleInitial: log.middleInitial || "",
        lastName: log.lastName
        }];

        return {
        IDNumber: log.IDNumber,
        Name: fullName,
        PositionOrProgram: log.PositionOrProgram,
        yearLevel: log.yearLevel,
        LogType: log.LogType,
        LogTime: [logTimeFormatted]
        };
    });

    res.json({ success: true, logs: modifiedResults });
    });
});

app.get('/api/logs/id', (req, res) => {
    const { id } = req.query;  // Get 'id' from query parameters
    
    if (!id) {
        return res.status(400).json({ success: false, error: 'ID is required' });
    }
    
    const fetchIDLogsQuery = `
        SELECT 
            IDNumber,
            firstName,
            middleInitial,
            lastName, 
            CASE 
                WHEN Position = 'Student' THEN Program 
                ELSE Position 
            END AS PositionOrProgram,
            yearLevel,
            LogType, 
            LogTime 
        FROM ustplogs 
        WHERE IDNumber = ? 
        ORDER BY LogTime DESC
    `;
    
    connection.query(fetchIDLogsQuery, [id], (err, results) => {
        if (err) {
            console.error('Error fetching logs by ID:', err);
            return res.status(500).json({ success: false, error: 'Error fetching logs by ID' });
        }

        // Format the results to match the desired structure
        const formattedLogs = results.map(log => {
            // Format date and time for LogTime
            const logDate = new Date(log.LogTime);
            const formattedDate = logDate.toDateString();
            const formattedTime = logDate.toLocaleTimeString();

            // Construct fullName based on the presence of middleInitial
            let fullName = `${log.firstName}`;
            if (log.middleInitial) {
                fullName += ` ${log.middleInitial.trim()}.`;
            }
            fullName += ` ${log.lastName}`;

            // Create an object with formatted log data
            return {
                IDNumber: log.IDNumber,
                Name: [
                    {
                        fullName: fullName.trim(),
                        firstName: log.firstName,
                        middleInitial: log.middleInitial ? log.middleInitial.trim() : "",
                        lastName: log.lastName
                    }
                ],
                PositionOrProgram: log.PositionOrProgram,
                yearLevel: log.yearLevel,
                LogType: log.LogType,
                LogTime: [
                    {
                        date: formattedDate,
                        time: formattedTime
                    }
                ]
            };
        });

        res.json({ success: true, logs: formattedLogs });
    });
});

app.get('/api/logs/name', (req, res) => {
    const { name } = req.query;
  
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
  
    // Trim spaces and log the name query for debugging
    const trimmedName = name.trim();
    console.log("Trimmed Name Query:", trimmedName);  // Log the trimmed name query
  
    const nameParts = trimmedName.split(/\s+/);
  
    let query = `
      SELECT 
          IDNumber,
          firstName,
          middleInitial,
          lastName,
          CASE 
              WHEN Position = 'Student' THEN Program 
              ELSE Position 
          END AS PositionOrProgram,
          yearLevel,
          LogType, 
          LogTime 
      FROM ustplogs 
      WHERE 1=1
    `;
    let params = [];
  
    if (nameParts.length === 1) {
      query += " AND firstName LIKE ?";
      params.push(`%${nameParts[0]}%`);
    } else if (nameParts.length === 2) {
      query += " AND firstName LIKE ? AND lastName LIKE ?";
      params.push(`%${nameParts[0]}%`, `%${nameParts[1]}%`);
    } else if (nameParts.length === 3) {
      query += " AND firstName LIKE ? AND middleInitial LIKE ? AND lastName LIKE ?";
      params.push(`%${nameParts[0]}%`, `%${nameParts[1]}%`, `%${nameParts[2]}%`);
    }
  
    // Log the final query and params
    console.log("SQL Query:", query);
    console.log("SQL Params:", params);
  
    connection.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching logs by name:', err);
        return res.status(500).json({ success: false, error: 'Error fetching logs by name' });
      }
  
      const formattedLogs = results.map(log => {
        const logDate = new Date(log.LogTime);
        const formattedDate = logDate.toDateString();
        const formattedTime = logDate.toLocaleTimeString();
  
        let fullName = `${log.firstName}`;
        if (log.middleInitial) {
          fullName += ` ${log.middleInitial.trim()}.`;
        }
        fullName += ` ${log.lastName}`;
  
        return {
          IDNumber: log.IDNumber,
          Name: [
            {
              fullName: fullName.trim(),
              firstName: log.firstName,
              middleInitial: log.middleInitial ? log.middleInitial.trim() : "",
              lastName: log.lastName
            }
          ],
          PositionOrProgram: log.PositionOrProgram,
          yearLevel: log.yearLevel,
          LogType: log.LogType,
          LogTime: [
            {
              date: formattedDate,
              time: formattedTime
            }
          ]
        };
      });
  
      res.json({ success: true, logs: formattedLogs });
    });
  });                

// Fetch logs by college
app.get('/api/logs/college/:college', (req, res) => {
    const { college } = req.params;
    const { date } = req.query; // Retrieve the date from the query string

    const fetchLogsByCollegeQuery = `
        SELECT 
            IDNumber,
            firstName,
            middleInitial,
            lastName, 
            CASE 
                WHEN Position = 'Student' THEN Program 
                ELSE Position 
            END AS PositionOrProgram,
            yearLevel,
            LogType, 
            LogTime 
        FROM ustplogs 
        WHERE College = ? 
        AND DATE(LogTime) = ? -- Filter by date
        ORDER BY LogTime DESC
    `;

    connection.query(fetchLogsByCollegeQuery, [college, date], (err, results) => {
        if (err) {
            console.error('Error fetching logs by college:', err);
            return res.status(500).json({ success: false, error: 'Error fetching logs by college' });
        }

        const formattedLogs = results.map(log => {
            const logDate = new Date(log.LogTime);
            const formattedDate = logDate.toDateString();
            const formattedTime = logDate.toLocaleTimeString();

            let fullName = `${log.firstName}`;
            if (log.middleInitial) {
                fullName += ` ${log.middleInitial.trim()}.`;
            }
            fullName += ` ${log.lastName}`;

            return {
                IDNumber: log.IDNumber,
                Name: [
                    {
                        fullName: fullName.trim(),
                        firstName: log.firstName,
                        middleInitial: log.middleInitial ? log.middleInitial.trim() : "",
                        lastName: log.lastName
                    }
                ],
                PositionOrProgram: log.PositionOrProgram,
                yearLevel: log.yearLevel,
                LogType: log.LogType,
                LogTime: [
                    {
                        date: formattedDate,
                        time: formattedTime
                    }
                ]
            };
        });

        res.json({ success: true, logs: formattedLogs });
    });
});

app.get('/api/logs/college/program/:program', (req, res) => {
    const { program } = req.params;
    const { date } = req.query;

    const fetchLogsByProgramQuery = `
        SELECT 
            IDNumber,
            firstName,
            middleInitial,
            lastName, 
            CASE 
                WHEN Position = 'Student' THEN Program 
                ELSE Position 
            END AS PositionOrProgram,
            yearLevel,
            LogType,
            LogTime 
        FROM ustplogs 
        WHERE Program = ? 
        AND DATE(LogTime) = ? -- Filter by date
        ORDER BY LogTime DESC
    `;

    connection.query(fetchLogsByProgramQuery, [program, date], (err, results) => {
        if (err) {
            console.error('Error fetching logs by program:', err);
            return res.status(500).json({ success: false, error: 'Error fetching logs by program' });
        }

        const formattedLogs = results.map(log => {
            const logDate = new Date(log.LogTime);
            const formattedDate = logDate.toDateString();
            const formattedTime = logDate.toLocaleTimeString();

            let fullName = `${log.firstName}`;
            if (log.middleInitial) {
                fullName += ` ${log.middleInitial.trim()}.`;
            }
            fullName += ` ${log.lastName}`;

            return {
                IDNumber: log.IDNumber,
                Name: [
                    {
                        fullName: fullName.trim(),
                        firstName: log.firstName,
                        middleInitial: log.middleInitial ? log.middleInitial.trim() : "",
                        lastName: log.lastName
                    }
                ],
                PositionOrProgram: log.PositionOrProgram,
                yearLevel: log.yearLevel,
                LogType: log.LogType,
                LogTime: [
                    {
                        date: formattedDate,
                        time: formattedTime
                    }
                ]
            };
        });

        res.json({ success: true, logs: formattedLogs });
    });
});

app.get('/api/logs/employee', (req, res) => {
    const { date } = req.query;

    const fetchLogsForEmployeeQuery = `
        SELECT 
            IDNumber,
            firstName,
            middleInitial,
            lastName, 
            CASE 
                WHEN Position = 'Student' THEN Program 
                ELSE Position 
            END AS PositionOrProgram,
            yearLevel,
            LogType,
            LogTime 
        FROM ustplogs 
        WHERE Position NOT IN ("Student", "Visitor") 
        AND DATE(LogTime) = ? -- Filter by date
        ORDER BY LogTime DESC
    `;

    connection.query(fetchLogsForEmployeeQuery, [date], (err, results) => {
        if (err) {
            console.error('Error fetching employee logs:', err);
            return res.status(500).json({ success: false, error: 'Error fetching employee logs data' });
        }

        const formattedLogs = results.map(log => {
            const logDate = new Date(log.LogTime);
            const formattedDate = logDate.toDateString();
            const formattedTime = logDate.toLocaleTimeString();

            let fullName = `${log.firstName}`;
            if (log.middleInitial) {
                fullName += ` ${log.middleInitial.trim()}.`;
            }
            fullName += ` ${log.lastName}`;

            return {
                IDNumber: log.IDNumber,
                Name: [
                    {
                        fullName: fullName.trim(),
                        firstName: log.firstName,
                        middleInitial: log.middleInitial ? log.middleInitial.trim() : "",
                        lastName: log.lastName
                    }
                ],
                PositionOrProgram: log.PositionOrProgram,
                yearLevel: log.yearLevel,
                LogType: log.LogType,
                LogTime: [
                    {
                        date: formattedDate,
                        time: formattedTime
                    }
                ]
            };
        });

        res.json({ success: true, logs: formattedLogs });
    });
});

app.get('/api/logs/visitor', (req, res) => {
    const { date } = req.query;

    const fetchVisitorLogsQuery = `
        SELECT 
            firstName,
            middleInitial,
            lastName,
            Position,
            Program,
            yearLevel,
            LogType,
            LogTime
        FROM ustplogs 
        WHERE Position = 'Visitor' 
        AND DATE(LogTime) = ? -- Filter by date
        ORDER BY LogTime DESC
    `;

    connection.query(fetchVisitorLogsQuery, [date], (err, results) => {
        if (err) {
            console.error('Error fetching visitor logs:', err);
            return res.status(500).json({ success: false, error: 'Error fetching visitor logs data' });
        }

        const modifiedResults = results.map(log => {
            const fullName = log.middleInitial 
                ? `${log.firstName} ${log.middleInitial.trim()}. ${log.lastName}`
                : `${log.firstName} ${log.lastName}`;

            const logTime = new Date(log.LogTime);
            const formattedLogTime = {
                date: logTime.toDateString(),
                time: logTime.toLocaleTimeString()
            };

            return {
                FullName: fullName,
                PositionOrProgram: log.Position === 'Student' ? log.Program : log.Position,
                YearLevel: log.yearLevel,
                LogType: log.LogType,
                LogTime: [formattedLogTime]
            };
        });

        res.json({ success: true, logs: modifiedResults });
    });
});

app.get('/api/logs/date', (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ success: false, error: 'Date parameter is required.' });
    }

    const fetchLogsByDateQuery = `
        SELECT 
            IDNumber,
            firstName,
            middleInitial,
            lastName,
            Position,
            Program,
            yearLevel,
            LogType,
            LogTime
        FROM ustplogs 
        WHERE DATE(LogTime) = DATE(?)  -- Flexible date matching
        ORDER BY LogTime DESC
    `;

    connection.query(fetchLogsByDateQuery, [date], (err, results) => {
        if (err) {
            console.error('Error fetching logs for the specified date:', err);
            return res.status(500).json({ success: false, error: 'Error fetching logs data' });
        }

        const modifiedResults = results.map(log => {
            // Construct full name with middle initial if available
            const fullName = log.middleInitial 
                ? `${log.firstName} ${log.middleInitial.trim()}. ${log.lastName}`
                : `${log.firstName} ${log.lastName}`;

            // Format LogTime
            const logTime = new Date(log.LogTime);
            const formattedLogTime = {
                date: logTime.toLocaleDateString('en-US', {
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                }),  // e.g., "Tue Nov 19 2024"
                time: logTime.toLocaleTimeString('en-US', {
                    hour: 'numeric', 
                    minute: '2-digit', 
                    second: '2-digit'
                })  // e.g., "7:01:40 PM"
            };

            return {
                IDNumber: log.IDNumber || "",
                Name: [
                    {
                        fullName: fullName.trim(),
                        firstName: log.firstName,
                        middleInitial: log.middleInitial ? log.middleInitial.trim() : "",
                        lastName: log.lastName
                    }
                ],
                PositionOrProgram: log.Position === 'Student' ? log.Program : log.Position,
                yearLevel: log.yearLevel || "",
                LogType: log.LogType,
                LogTime: [formattedLogTime]
            };
        });

        res.json({ success: true, logs: modifiedResults });
    });
});     

app.post('/api/timein', (req, res) => {
  const { firstName, lastName, logType, purpose } = req.body;

  if (!firstName || !lastName || !logType) {
    return res.status(400).json({ success: false, error: 'First name, last name, and logType are required.' });
  }

  // SQL query to check if the visitor exists in ustplogs
  const fetchSql = `
      SELECT * FROM ustplogs
      WHERE firstName = ? AND lastName = ?
      ORDER BY LogTime DESC LIMIT 1
  `;

  connection.query(fetchSql, [firstName, lastName], (fetchErr, fetchResults) => {
    if (fetchErr) {
      console.error('Fetch error:', fetchErr);
      return res.status(500).json({ success: false, error: 'Database error', details: fetchErr.message });
    }

        // If the visitor has no logs, proceed to log Time In as a new entry
        if (fetchResults.length === 0) {
            // Check if the visitor exists in ustpdata
            const checkVisitorSql = `
                SELECT * FROM ustpdata
                WHERE firstName = ? AND lastName = ?
            `;
            
            connection.query(checkVisitorSql, [firstName, lastName], (visitorErr, visitorResults) => {
                if (visitorErr) {
                    console.error('Visitor fetch error:', visitorErr);
                    return res.status(500).json({ success: false, error: 'Database error', details: visitorErr.message });
                }

                if (visitorResults.length === 0) {
                    return res.status(404).json({ success: false, error: 'Visitor not found in ustpdata.' });
                }

                const visitorData = visitorResults[0];

                // Insert a new Time In log
                const logSql = `
                    INSERT INTO ustplogs 
                    (UID, firstName, middleInitial, lastName, Position, IDNumber, Program, College, yearLevel, Address, Purpose, LogTime, LogType) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
                `;
                const logValues = [
                    visitorData.UID,
                    visitorData.firstName,
                    visitorData.middleInitial,
                    visitorData.lastName,
                    visitorData.Position || 'Student',
                    visitorData.IDNumber,
                    visitorData.Program,
                    visitorData.College,
                    visitorData.yearLevel,
                    visitorData.Address,
                    purpose,
                    logType
                ];

                connection.query(logSql, logValues, (logErr) => {
                    if (logErr) {
                        console.error('Log insert error:', logErr);
                        return res.status(500).json({ success: false, error: 'Log insert error', details: logErr.message });
                    }

                    res.json({ success: true, message: `${visitorData.firstName} ${visitorData.lastName} successfully logged in.` });
                });
            });
        } else {
            const latestLog = fetchResults[0];

            // If latest log is "Time In," show an error; if "Time Out," proceed to log a new Time In
            if (latestLog.LogType === 'Time In') {
                return res.status(400).json({
                    success: false,
                    error: `${latestLog.firstName} ${latestLog.lastName} has already clocked in!`
                });
            } else if (latestLog.LogType === 'Time Out') {
                // Proceed to insert a new Time In log
                const logSql = `
                    INSERT INTO ustplogs 
                    (UID, firstName, middleInitial, lastName, Position, IDNumber, Program, College, yearLevel, Address, Purpose, LogTime, LogType) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
                `;
                const logValues = [
                    latestLog.UID,
                    latestLog.firstName,
                    latestLog.middleInitial,
                    latestLog.lastName,
                    latestLog.Position || 'Student',
                    latestLog.IDNumber,
                    latestLog.Program,
                    latestLog.College,
                    latestLog.yearLevel,
                    latestLog.Address,
                    purpose,
                    logType
                ];

                connection.query(logSql, logValues, (logErr) => {
                    if (logErr) {
                        console.error('Log insert error:', logErr);
                        return res.status(500).json({ success: false, error: 'Log insert error', details: logErr.message });
                    }

                    res.json({
                        success: true,
                        message: `${latestLog.firstName} ${latestLog.lastName} successfully logged in again.`
                    });
                });
            }
        }
    });
});

app.post('/api/timeout', (req, res) => {
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
        return res.status(400).json({ success: false, error: 'First name and last name are required.' });
    }

    // Fetch visitor data based on the provided first and last name
    const fetchSql = `
        SELECT UID, firstName, middleInitial, lastName, Position, IDNumber, Program, College, yearLevel, Address, Purpose 
        FROM ustpdata 
        WHERE CONCAT(firstName, ' ', lastName) LIKE ?
    `;

    // Construct the name pattern
    const namePattern = `%${firstName} ${lastName}%`;

    connection.query(fetchSql, [namePattern], (fetchErr, fetchResults) => {
        if (fetchErr) {
            console.error('Fetch error: ', fetchErr);
            return res.status(500).json({ success: false, error: 'Fetch error', details: fetchErr.message });
        }

        if (fetchResults.length === 0) {
            return res.status(404).json({ success: false, error: 'Visitor not found.' });
        }

        const schoolData = fetchResults[0];

        // Check if the visitor has logged in with "Time In"
        const checkLogSql = `
            SELECT LogType 
            FROM ustplogs 
            WHERE UID = ? 
            ORDER BY LogTime DESC LIMIT 1
        `;

        connection.query(checkLogSql, [schoolData.UID], (checkErr, checkResults) => {
            if (checkErr) {
                console.error('Check log error: ', checkErr);
                return res.status(500).json({ success: false, error: 'Check log error', details: checkErr.message });
            }

            if (checkResults.length === 0) {
                return res.status(400).json({ success: false, error: 'Visitor has not clocked in yet!' });
            }

            if (checkResults[0].LogType === 'Time Out') {
                return res.status(400).json({ success: false, error: 'Visitor already clocked out!' });
            }

            // Proceed with logging the Time Out
            const logSql = `
                INSERT INTO ustplogs (UID, firstName, middleInitial, lastName, Position, IDNumber, Program, College, yearLevel, Address, Purpose, LogTime, LogType) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
            `;
            const logValues = [
                schoolData.UID,
                schoolData.firstName,
                schoolData.middleInitial,
                schoolData.lastName,
                schoolData.Position || 'Student', // Default to 'Student' if no position
                schoolData.IDNumber,
                schoolData.Program,
                schoolData.College,
                schoolData.yearLevel,
                schoolData.Address,
                schoolData.Purpose,
                'Time Out'
            ];

            connection.query(logSql, logValues, (logErr) => {
                if (logErr) {
                    console.error('Log error: ', logErr);
                    return res.status(500).json({ success: false, error: 'Log error', details: logErr.message });
                }

                res.json({ success: true, message: 'Visitor successfully logged out.' });
            });
        });
    });
});

// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Main API Route
app.get('/api/logs/count', (req, res) => {
  console.log('Received request for /api/logs/count'); // Log when the request is received

  const today = getTodayDate(); // Get today's date
  console.log("Today's Date: ", today); // Log the date for debugging

  const timeInQuery = 'SELECT COUNT(*) AS timeInCount FROM ustplogs WHERE LogType = "Time In" AND DATE(LogTime) = ?';
  const timeOutQuery = 'SELECT COUNT(*) AS timeOutCount FROM ustplogs WHERE LogType = "Time Out" AND DATE(LogTime) = ?';

  // Function to count logs for a specific college
  const countLogsForCollege = (college) => {
      return (req, res) => {
          const timeInSql = 'SELECT COUNT(*) AS timeInCount FROM ustplogs WHERE College = ? AND LogType = "Time In" AND DATE(LogTime) = ?';
          const timeOutSql = 'SELECT COUNT(*) AS timeOutCount FROM ustplogs WHERE College = ? AND LogType = "Time Out" AND DATE(LogTime) = ?';

          connection.query(timeInSql, [college, today], (timeInErr, timeInResults) => {
              if (timeInErr) {
                  console.error(`Time In query error for ${college}:`, timeInErr);
                  return res.status(500).json({ success: false, error: 'Error fetching Time In count' });
              }

              connection.query(timeOutSql, [college, today], (timeOutErr, timeOutResults) => {
                  if (timeOutErr) {
                      console.error(`Time Out query error for ${college}:`, timeOutErr);
                      return res.status(500).json({ success: false, error: 'Error fetching Time Out count' });
                  }

                  const totalRemaining = timeInResults[0].timeInCount - timeOutResults[0].timeOutCount;
                  console.log(`Total Remaining for ${college}:`, totalRemaining);

                  res.json({ totalRemaining });
              });
          });
      };
  };

  // Function to count logs for a specific position (Visitor or Employee)
  const countLogsForPosition = (position) => {
    return (req, res) => {
        console.log(`Position: ${position}`); // Log the position

        // Construct the SQL queries based on position
        let timeInSql, timeOutSql;

        if (position === 'Visitor') {
            timeInSql = 'SELECT COUNT(*) AS timeInCount FROM ustplogs WHERE Position = "Visitor" AND LogType = "Time In" AND DATE(LogTime) = ?';
            timeOutSql = 'SELECT COUNT(*) AS timeOutCount FROM ustplogs WHERE Position = "Visitor" AND LogType = "Time Out" AND DATE(LogTime) = ?';
        } else if (position === 'Employee') {
            // Corrected to exclude "Student" and "Visitor"
            timeInSql = 'SELECT COUNT(*) AS timeInCount FROM ustplogs WHERE Position NOT IN ("Visitor", "Student") AND LogType = "Time In" AND DATE(LogTime) = ?';
            timeOutSql = 'SELECT COUNT(*) AS timeOutCount FROM ustplogs WHERE Position NOT IN ("Visitor", "Student") AND LogType = "Time Out" AND DATE(LogTime) = ?';
        }

        // Execute the queries
        connection.query(timeInSql, [today], (timeInErr, timeInResults) => {
            if (timeInErr) {
                console.error(`Time In query error for ${position}:`, timeInErr);
                return res.status(500).json({ success: false, error: `Error fetching Time In count for ${position}` });
            }

            connection.query(timeOutSql, [today], (timeOutErr, timeOutResults) => {
                if (timeOutErr) {
                    console.error(`Time Out query error for ${position}:`, timeOutErr);
                    return res.status(500).json({ success: false, error: `Error fetching Time Out count for ${position}` });
                }

                const totalRemaining = timeInResults[0].timeInCount - timeOutResults[0].timeOutCount;
                console.log(`Total Remaining for ${position}:`, totalRemaining);

                res.json({ totalRemaining });
            });
        });
    };
};

  // Endpoint for Total Time In count (today's date)
  app.get('/api/logs/count/timein', (req, res) => {
      connection.query(timeInQuery, [today], (timeInErr, timeInResults) => {
          if (timeInErr) {
              console.error('Time In query error:', timeInErr);
              return res.status(500).json({ success: false, error: 'Error fetching Time In count' });
          }
          res.json({ totalEntry: timeInResults[0].timeInCount });
      });
  });

  // Endpoint for Total Time Out count (today's date)
  app.get('/api/logs/count/timeout', (req, res) => {
      connection.query(timeOutQuery, [today], (timeOutErr, timeOutResults) => {
          if (timeOutErr) {
              console.error('Time Out query error:', timeOutErr);
              return res.status(500).json({ success: false, error: 'Error fetching Time Out count' });
          }
          res.json({ totalExit: timeOutResults[0].timeOutCount });
      });
  });

  // Add the college routes (all use today's date)
  app.get('/api/logs/count/CITC', countLogsForCollege('CITC'));
  app.get('/api/logs/count/COT', countLogsForCollege('COT'));
  app.get('/api/logs/count/CSTE', countLogsForCollege('CSTE'));
  app.get('/api/logs/count/COM', countLogsForCollege('COM'));
  app.get('/api/logs/count/CSM', countLogsForCollege('CSM'));
  app.get('/api/logs/count/CEA', countLogsForCollege('CEA'));
  app.get('/api/logs/count/SHS', countLogsForCollege('SHS'));
  app.get('/api/logs/count/visitor', countLogsForPosition('Visitor'));
  app.get('/api/logs/count/employee', countLogsForPosition('Employee'));

    // Final query for Total Time In and Time Out count (today's date)
  connection.query(timeInQuery, [today], (timeInErr, timeInResults) => {
      if (timeInErr) {
          console.error('Time In query error:', timeInErr);
          return res.status(500).json({ success: false, error: 'Error fetching Time In count' });
      }

      connection.query(timeOutQuery, [today], (timeOutErr, timeOutResults) => {
          if (timeOutErr) {
              console.error('Time Out query error:', timeOutErr);
              return res.status(500).json({ success: false, error: 'Error fetching Time Out count' });
          }

          const totalRemaining = timeInResults[0].timeInCount - timeOutResults[0].timeOutCount;
          console.log('Total Remaining:', totalRemaining); // Log the total remaining
          res.json({ totalRemaining });
      });
  });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});