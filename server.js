import { SerialPort } from 'serialport';
import express from 'express';
import http from 'http';
import mysql from 'mysql2/promise'; // Use mysql2 for async/await support
import { Server as socketIo } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new socketIo(server);

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Fill in your MySQL password if applicable
  database: 'capstone',
};

// Serve a simple HTML page or a response for the root route
app.get('/', (req, res) => {
  res.send('Scanner server is running!');
});

// Connect to the MySQL database
let db;
(async () => {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database.');
  } catch (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }
})();

// Open COM3 and COM4 ports for scanners
const ports = {
  COM3: new SerialPort({ path: 'COM3', baudRate: 9600 }), // Time In
  // COM4: new SerialPort({ path: 'COM4', baudRate: 9600 }), // Time Out
};

Object.entries(ports).forEach(([portName, port]) => {
  port.on('data', async (data) => {
    const logType = portName === 'COM3' ? 'Time In' : 'Time Out';
    const scannedData = data.toString().trim();
    const scannedID = scannedData.split(/\s+/)[0]; // Extract the ID number

    console.log(`Data from ${portName}:`, scannedData);

    try {
      // Check if the ID exists in ustpdata
      const [rows] = await db.execute('SELECT * FROM ustpdata WHERE IDNumber = ?', [scannedID]);

      if (rows.length === 0) {
        console.error(`ID not found in ustpdata: ${scannedID}`);
        return;
      }

      // Extract data from ustpdata
      const {
        UID,
        firstName,
        middleInitial,
        lastName,
        Position,
        IDNumber,
        Program,
        College,
        yearLevel,
        Address,
        Purpose,
      } = rows[0];

      // Determine Position based on Program (or modify this logic if needed)
      const position = Program ? 'Student' : Position; // If a Program exists, it's a student; otherwise, it's an employee.

      // LogTime is the current timestamp
      const logTime = new Date();

      // Insert data into ustplogs
      await db.execute(
        `INSERT INTO ustplogs (UID, firstName, middleInitial, lastName, Position, IDNumber, Program, College, yearLevel, Address, Purpose, LogTime, LogType)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          UID,
          firstName,
          middleInitial,
          lastName,
          position,
          IDNumber,
          Program,
          College,
          yearLevel,
          Address,
          Purpose,
          logTime,
          logType,
        ]
      );

      console.log(`Successfully logged: ${logType} for ${scannedID}`);
    } catch (err) {
      console.error('Error handling scanner data:', err.message);
    }
  });

  port.on('error', (err) => {
    console.error(`Error with ${portName}:`, err.message);
  });
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
