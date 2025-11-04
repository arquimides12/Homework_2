const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: 
    ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket connection event
io.on('connection', (socket) => {
  logger.info('A new user connected.');

  let progress = 0;

  const interval = setInterval(() => {
    progress += 10;
    if (progress <= 100) {
      io.emit('progressUpdate', progress); // Send update to all clients
      logger.info(`Progress updated: ${progress}%`);
    } else {
      clearInterval(interval);
      io.emit('progressComplete');
      logger.info('Task completed successfully.');
    }
  }, 1000);

  socket.on('disconnect', () => {
    logger.warn('A user disconnected.');
  });
});

server.listen(3000, () => {
  logger.info('Server running at http://localhost:3000');
});

