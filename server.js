import { SerialPort } from 'serialport'; // Use named import for SerialPort
import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new socketIo(server);

// Serve a simple HTML page or a response for the root route
app.get('/', (req, res) => {
  res.send('Scanner server is running!');
});

// Open COM3 with the specified baud rate
const port = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
});

port.on('data', (data) => {
  console.log('Data from scanner:', data.toString());
  // Emit data to the client through WebSocket
  io.emit('scannerData', data.toString());
});

port.on('error', (err) => {
  console.error('Error with serial port:', err.message);
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
