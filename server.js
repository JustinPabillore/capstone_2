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
    const logType = portName === 'COM3' ? 'Time Out' : 'Time In';
    const scannedData = data.toString().trim();

    console.log(`Data from ${portName}:`, scannedData);

    try {
      // Check if the ID exists in ustpdata (Student logic)
      const scannedID = scannedData.split(/\s+/)[0]; // Extract the ID number
      const [studentRows] = await db.execute('SELECT * FROM ustpdata WHERE IDNumber = ?', [scannedID]);

      if (studentRows.length > 0) {
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
        } = studentRows[0];

        const position = Program ? 'Student' : Position; // If a Program exists, it's a student; otherwise, it's an employee.

        const logTime = new Date();

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

        console.log(`Successfully logged student: ${logType} for ${scannedID}`);
        return; // Exit early if it's a student
      }

      // Employee logic
      const nameParts = scannedData.split(' ');
      const middleInitialIndex = nameParts.findIndex((part) => /^[A-Z]\.$/.test(part)); // Find middle initial like "M."
      const lastNameIndex = middleInitialIndex + 1; // Assume the last name comes after the middle initial

      // Extract first name (everything before the middle initial or last name)
      const firstName = nameParts.slice(0, middleInitialIndex > 0 ? middleInitialIndex : nameParts.length - 1).join(' ');

      if (!firstName) {
        console.error('Failed to parse employee first name from scanned data:', scannedData);
        return;
      }

      const [employeeRows] = await db.execute('SELECT * FROM ustpdata WHERE firstName = ?', [firstName]);

      if (employeeRows.length === 0) {
        console.error(`Employee first name not found in ustpdata: ${firstName}`);
        return;
      }

      const {
        UID,
        middleInitial,
        lastName,
        Position,
        Program,
        College,
        yearLevel,
        Address,
        Purpose,
      } = employeeRows[0];

      const logTime = new Date();

      await db.execute(
        `INSERT INTO ustplogs (UID, firstName, middleInitial, lastName, Position, Program, College, yearLevel, Address, Purpose, LogTime, LogType)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          UID,
          firstName,
          middleInitial,
          lastName,
          Position || 'Employee', // Default to 'Employee' if Position is not provided
          Program,
          College,
          yearLevel,
          Address,
          Purpose,
          logTime,
          logType,
        ]
      );

      console.log(`Successfully logged employee: ${logType} for ${firstName}`);
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
