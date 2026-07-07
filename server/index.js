// FILE: server/index.js
require('dotenv').config();
const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { YSocketIO } = require('y-socket.io/dist/server');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const questionRoutes = require('./routes/questions');
const socketManager = require('./sockets/socketManager');

const app = express();

// 1. DATABASE INITIALIZATION
const { initDb } = require('./db');
initDb();

// 2. MIDDLEWARE
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://impostercode.onrender.com" // <-- REPLACE WITH YOUR LIVE RENDER URL
  ],
  methods: ["GET", "POST"]
}));
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
// Using /api for leaderboard directly based on how client calls it
app.use('/api', userRoutes); 

// 4. SOCKET SERVER SETUP
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "https://impostercode.onrender.com"
    ],
    methods: ["GET", "POST"]
  }
});

const ysocketio = new YSocketIO(io, {});
ysocketio.initialize();

// Initialize all socket event listeners
socketManager(io, ysocketio);

// 5. DEPLOYMENT: SERVE STATIC REACT FILES
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// 6. START SERVER
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 SERVER RUNNING ON PORT ${PORT} (HTTP)`);
});