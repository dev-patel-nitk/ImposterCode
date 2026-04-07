// FILE: server/index.js
require('dotenv').config();
const DSA_QUESTIONS = require('./questions'); 
const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose'); 
const multer = require('multer');     
const path = require('path');         
const fs = require('fs');
const { YSocketIO } = require('y-socket.io/dist/server');
const bcrypt = require('bcryptjs');

const app = express();

// 🟢 FIXED: Strict CORS for Express API routes
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://impostercode.onrender.com" // <-- REPLACE WITH YOUR LIVE RENDER URL
  ],
  methods: ["GET", "POST"]
}));
app.use(express.json()); 

const TOTAL_QUESTIONS = DSA_QUESTIONS.length; 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. MONGODB CONFIGURATION
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/imposter_code";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ DATABASE CONNECTED"))
  .catch(err => console.log("❌ DB CONNECTION ERROR:", err));

// 2. USER SCHEMA
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String },
  photo: { type: String, default: "" },
  isGuest: { type: Boolean, default: false },
  rank: { type: String, default: "RECRUIT" },
  preferredLanguage: { type: String, default: "Python" },
  xp: { type: Number, default: 0 },
  stats: {
    crewmate: { wins: { type: Number, default: 0 } },
    imposter: { wins: { type: Number, default: 0 } }
  }
});
const User = mongoose.model('User', userSchema);

// 3. MULTER CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir); 
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const upload = multer({ storage, fileFilter });

// 4. REST API ROUTES
app.get('/api/users/search', async (req, res) => {
  const { q } = req.query;
  try {
    const users = await User.find({ username: { $regex: q, $options: 'i' }, isGuest: false })
      .limit(5)
      .select('username photo');
    res.json(users);
  } catch (err) { res.status(500).json({ error: "Search failed" }); }
});

app.get('/api/users/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) { res.status(500).json({ error: "Profile fetch failed" }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password, isGuest } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) {
      if (!isGuest && !password) return res.status(400).json({ error: "Password required" });
      
      const hashedPassword = (!isGuest && password) ? await bcrypt.hash(password, 10) : "";
      user = new User({ 
        username, 
        password: hashedPassword,
        isGuest,
        photo: "",
        stats: { crewmate: { wins: 0 }, imposter: { wins: 0 } },
        xp: 0 
      });
      await user.save();
    } else {
      if (!user.isGuest) {
        if (!password) return res.status(401).json({ error: "Password missing" });
        const isMatch = await bcrypt.compare(password, user.password || "");
        if (!isMatch) return res.status(401).json({ error: "Incorrect password" });
      }
    }
    const { password: _, ...safeUser } = user.toObject();
    res.json(safeUser);
  } catch (err) { res.status(500).json({ error: "Auth failed" }); }
});

app.post('/api/users/upload', upload.single('photo'), async (req, res) => {
  const { username } = req.body;
  const photoUrl = `/uploads/${req.file.filename}`;
  try {
    await User.findOneAndUpdate({ username }, { photo: photoUrl }, { new: true });
    res.json({ success: true, photoUrl });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaders = await User.find({ isGuest: false })
      .sort({ xp: -1 })
      .limit(10)
      .select('username xp rank stats photo');
    res.json(leaders);
  } catch (err) { res.status(500).json({ error: "Leaderboard failed" }); }
});

// Securely serve a random question
app.get('/api/questions/generate', (req, res) => {
  try {
    if (!DSA_QUESTIONS || DSA_QUESTIONS.length === 0) {
      return res.status(500).json({ error: "Internal Database empty." });
    }
    const randomIdx = Math.floor(Math.random() * DSA_QUESTIONS.length);
    const problem = DSA_QUESTIONS[randomIdx];
    console.log(`✅ Loaded Verified Problem: ${problem.title}`);
    res.json(problem); 
  } catch (error) {
    console.error("❌ Problem fetch failed:", error);
    res.status(500).json({ error: "Mainframe offline." });
  }
});

// 5. SOCKET SERVER SETUP
const server = http.createServer(app);

// 🟢 FIXED: Strict CORS for Socket.io WebSockets
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "https://impostercode.onrender.com" // <-- REPLACE WITH YOUR LIVE RENDER URL
    ],
    methods: ["GET", "POST"]
  }
});

const ysocketio = new YSocketIO(io, {});
ysocketio.initialize();

const rooms = {};

const JDOODLE_CONFIG = {
  python: { language: "python3", versionIndex: "4" },
  java: { language: "java", versionIndex: "4" },
  c: { language: "c", versionIndex: "5" },
  cpp: { language: "cpp", versionIndex: "5" },
  nodejs: { language: "nodejs", versionIndex: "4" }
};

const API_KEYS = [
  { clientId: "cfa368c3611d5a5a2aa6f2ce9f9df889", clientSecret: "f7686465d7b2f52c8e3fdfd5f7d3d79aeb0dec44490fd79f5d89825adc618017" },
  { clientId: "7397db393db95d2eaa3e95fbe68f30e0", clientSecret: "9186750c8ad4b8b0630be1882603758d5b88336c152a2d370d183b159d5f2335" },
  { clientId: "f39ce27c14cb4ac8378f9ae4f22ffaed", clientSecret: "1c33ea31a870274f864fc8c94b1ebaca744b55967174050d46be1dd5b96fcc80" }
];

let currentKeyIndex = 0;
function getNextCredential() {
  const credential = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return credential;
}

function getAllRooms() {
  return Object.keys(rooms).map((r) => ({
    roomId: r,
    users: rooms[r].users.length,
    language: rooms[r].language,
    host: rooms[r].users.find((u) => u.id === rooms[r].hostId)?.username || "Unknown",
    gameStatus: rooms[r].gameStatus 
  }));
}

function calculateVotes(votes, users) {
  const tally = {};
  let skipCount = 0;
  users.forEach(u => tally[u.id] = 0);
  Object.values(votes).forEach(targetId => {
    if (targetId === "SKIP") skipCount++;
    else if (tally[targetId] !== undefined) tally[targetId]++;
  });
  let maxVotes = 0;
  let candidate = null;
  let isTie = false;
  Object.entries(tally).forEach(([id, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      candidate = id;
      isTie = false;
    } else if (count === maxVotes && count > 0) {
      isTie = true;
    }
  });
  if (isTie || skipCount >= maxVotes) return null;
  return candidate;
}

function endMeeting(roomId) {
  const room = rooms[roomId];
  if (!room || !room.activeMeeting) return;

  clearInterval(room.activeMeeting.interval);
  const ejectedId = calculateVotes(room.activeMeeting.votes, room.users);
  
  if (ejectedId) {
    room.kickedIds.push(ejectedId);
  }

  room.gameStatus = "running"; 
  io.to(roomId).emit("meeting-ended", { ejectedId, votes: room.activeMeeting.votes });
  room.activeMeeting = null;
}

// 6. SOCKET EVENT LISTENERS
io.on("connection", (socket) => {
  socket.emit("room-list", getAllRooms());

  socket.on("sync-users", ({ roomId }) => {
    if (rooms[roomId]) socket.emit("user-list-update", rooms[roomId].users);
  });

  socket.on("create-room", ({ roomId, username, password }) => {
    if (rooms[roomId]) {
      socket.emit("error", "Room already exists! Please join instead.");
      return;
    }
    rooms[roomId] = {
      code: "// Start coding...",
      language: "python",
      password,
      hostId: socket.id,
      users: [],
      gameStatus: "waiting",
      duration: 600,
      impostorId: null,
      impostorUsername: null,
      meetingDuration: 60,
      meetingsLeft: 2,
      kickedIds: [],
      activeMeeting: null,
      activeQuestion: null,
      chatHistory: []
    };
    joinRoomLogic(socket, roomId, username);
    io.emit("room-list", getAllRooms());
  });

  socket.on("join-room", ({ roomId, username, password }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("error", "Room does not exist!");
      return;
    }
    if (room.users.length >= 6) {
      socket.emit("error", "Room is full! (Max 6 players)");
      return;
    }
    if (room.gameStatus !== "waiting") {
      socket.emit("error", "Mission in progress! Access Locked.");
      return;
    }
    if (room.password !== password) {
      socket.emit("error", "Incorrect Password!");
      return;
    }
    joinRoomLogic(socket, roomId, username);
  });

  socket.on("start-game", ({ roomId, duration, meetingDuration, questionData }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id) return;

    room.gameStatus = "running";
    room.duration = duration * 60;
    room.meetingDuration = parseInt(meetingDuration) || 60;
    room.kickedIds = [];
    room.meetingsLeft = 2;
    room.activeQuestion = questionData; 

    const playerCount = room.users.length;
    room.impostorId = null;
    room.impostorUsername = null;
    if (playerCount >= 3) {
      const randomIndex = Math.floor(Math.random() * playerCount);
      const impostorUser = room.users[randomIndex];
      room.impostorId = impostorUser.id;
      room.impostorUsername = impostorUser.username;
    }

    io.to(roomId).emit("game-started", {
      duration: room.duration,
      impostorId: room.impostorId,
      meetingsLeft: room.meetingsLeft,
      questionData: room.activeQuestion 
    });
    io.emit("room-list", getAllRooms());
  });

  socket.on("call-emergency", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.gameStatus !== "running" || room.meetingsLeft <= 0 || room.kickedIds.includes(socket.id)) {
        return;
    }
    room.meetingsLeft--;
    room.gameStatus = "meeting";
    room.activeMeeting = { votes: {}, timeLeft: room.meetingDuration, interval: null };

    io.to(roomId).emit("meeting-started", {
      caller: room.users.find(u => u.id === socket.id)?.username,
      timeLeft: room.meetingDuration,
      meetingsLeft: room.meetingsLeft
    });

    let timer = room.meetingDuration;
    room.activeMeeting.interval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        endMeeting(roomId);
      }
    }, 1000);
  });

  socket.on("cast-vote", ({ roomId, targetId }) => {
    const room = rooms[roomId];
    if (room && room.gameStatus === "meeting" && !room.kickedIds.includes(socket.id)) {
      if (room.activeMeeting.votes[socket.id]) return; 
      
      room.activeMeeting.votes[socket.id] = targetId;
      io.to(roomId).emit("vote-cast", { userId: socket.id }); 

      const aliveUserCount = room.users.filter(u => !room.kickedIds.includes(u.id)).length;
      const totalVotes = Object.keys(room.activeMeeting.votes).length;

      if (totalVotes >= aliveUserCount) {
        endMeeting(roomId);
      }
    }
  });

  socket.on("run-code", async ({ roomId, language, code, stdin }) => {
    if (rooms[roomId]?.kickedIds.includes(socket.id)) {
        io.to(roomId).emit("code-output", "🚫 SYSTEM ERROR: You have been ejected. Access Denied.");
        return;
    }
    const config = JDOODLE_CONFIG[language];
    if (!config) return io.to(roomId).emit("code-output", "Language not supported.");
    
    const { clientId, clientSecret } = getNextCredential();
    try {
      io.to(roomId).emit("code-output", "Running code...");
      const response = await axios.post("https://api.jdoodle.com/v1/execute", {
        clientId, clientSecret, script: code, stdin: stdin || "", 
        language: config.language, versionIndex: config.versionIndex
      });
      const { output, statusCode, memory, cpuTime } = response.data;
      const finalOutput = `${output}\n\n[Execution Info]\nStatus: ${statusCode}\nMemory: ${memory || 0}kb\nCPU: ${cpuTime || 0}s`;
      io.to(roomId).emit("code-output", finalOutput);
    } catch (error) { io.to(roomId).emit("code-output", "Execution Error"); }
  });

  socket.on("submit-code", async ({ roomId, language, code, stdin }) => {
    if (rooms[roomId]?.kickedIds.includes(socket.id)) {
        io.to(roomId).emit("submit-result", { success: false, output: "🚫 EJECTED USERS CANNOT SUBMIT." });
        return;
    }
    const config = JDOODLE_CONFIG[language];
    if (!config) return io.to(roomId).emit("submit-result", { success: false, output: "Error." });
    
    const { clientId, clientSecret } = getNextCredential();
    try {
      const response = await axios.post("https://api.jdoodle.com/v1/execute", {
        clientId, clientSecret, script: code, stdin, 
        language: config.language, versionIndex: config.versionIndex
      });
      io.to(roomId).emit("submit-result", { 
        success: true, output: response.data.output, memory: response.data.memory, cpuTime: response.data.cpuTime 
      });
    } catch (error) { io.to(roomId).emit("submit-result", { success: false, output: "Execution Error" }); }
  });

  socket.on("send-chat-message", ({ roomId, message, username }) => {
    const room = rooms[roomId];
    if (!room) return;
    const cleanMessage = String(message).replace(/<[^>]*>/g, '').substring(0, 500);
    const msgObj = { message: cleanMessage, username, timestamp: Date.now() };
    room.chatHistory = [...(room.chatHistory || []), msgObj].slice(-50);
    io.to(roomId).emit("receive-chat-message", msgObj);
  });

  socket.on("trigger-sabotage", ({ roomId, effect }) => {
    const room = rooms[roomId];
    if (!room || room.gameStatus !== "running") return;
    if (room.impostorId !== socket.id) return;
    socket.to(roomId).emit("sabotage-triggered", { effect });
  });

  function joinRoomLogic(socket, roomId, username) {
    socket.join(roomId);
    if (!rooms[roomId].users.find(u => u.id === socket.id)) {
      rooms[roomId].users.push({ id: socket.id, username });
    }
    const isHost = rooms[roomId].hostId === socket.id;
    socket.emit("join-success", { roomId, isHost });
    socket.emit("code-update", rooms[roomId].code);
    socket.emit("language-update", rooms[roomId].language);
    socket.emit("question-update", rooms[roomId].activeQuestion); 
    
    if (rooms[roomId].chatHistory && rooms[roomId].chatHistory.length > 0) {
      socket.emit("chat-history", rooms[roomId].chatHistory);
    }
    io.to(roomId).emit("user-list-update", rooms[roomId].users);
    io.emit("room-list", getAllRooms());
  }

  socket.on("language-change", ({ roomId, language }) => {
    if (rooms[roomId]) {
      rooms[roomId].language = language;
      io.to(roomId).emit("language-update", language);
      io.emit("room-list", getAllRooms());
    }
  });
  
  socket.on("typing", ({ roomId, username, color }) => {
    socket.to(roomId).emit("user-typing", { username, color });
  });

  socket.on("disconnect", () => {
    handleLeave(socket);
  });
  
  socket.on("leave-room", ({ roomId }) => {
      handleLeave(socket, roomId);
  });
  
  socket.on("end-room", ({ roomId }) => {
    if (rooms[roomId]) {
      io.to(roomId).emit("room-ended");
      delete rooms[roomId];
      io.emit("room-list", getAllRooms()); 
    }
  });

  function handleLeave(socket, specificRoomId = null) {
      for (const roomId in rooms) {
        if (specificRoomId && roomId !== specificRoomId) continue;
        const index = rooms[roomId].users.findIndex(u => u.id === socket.id);
        if (index !== -1) {
          rooms[roomId].users.splice(index, 1);
          if (rooms[roomId].users.length === 0) {
            delete rooms[roomId];
          } else {
            if (rooms[roomId].hostId === socket.id) rooms[roomId].hostId = rooms[roomId].users[0].id;
            io.to(roomId).emit("user-list-update", rooms[roomId].users);
          }
          io.emit("room-list", getAllRooms());
        }
      }
  }

  socket.on("mission-complete", async ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.gameStatus === "running") {
      room.gameStatus = "finished";
      try {
        const crewUsernames = room.users
          .filter(u => u.id !== room.impostorId)
          .map(u => u.username);
        await User.updateMany(
          { username: { $in: crewUsernames } },
          { $inc: { "stats.crewmate.wins": 1, "xp": 10 } }
        );
        console.log(`✅ Crewmate wins updated for: ${crewUsernames}`);
      } catch (err) {
        console.error("❌ Crewmate DB Update Error:", err);
      }
      io.to(roomId).emit("game-over", { result: "CREWMATE_WIN", impostorUsername: room.impostorUsername });
    }
  });

  socket.on("timer-tick", async ({ roomId, timeLeft }) => {
    const room = rooms[roomId];
    if (room) {
      socket.to(roomId).emit("timer-update", timeLeft);
      if (timeLeft <= 0 && room.gameStatus === "running") {
        room.gameStatus = "finished";
        const impostorIsDead = room.kickedIds.includes(room.impostorId);
        if (impostorIsDead) {
          io.to(roomId).emit("game-over", { result: "TIE", impostorUsername: room.impostorUsername });
        } else {
          try {
            const impostor = room.users.find(u => u.id === room.impostorId);
            if (impostor) {
              await User.findOneAndUpdate(
                { username: impostor.username },
                { $inc: { "stats.imposter.wins": 1, "xp": 20 } }
              );
              console.log(`✅ Impostor win updated for: ${impostor.username}`);
            }
          } catch (err) {
            console.error("❌ Impostor DB Update Error:", err);
          }
          io.to(roomId).emit("game-over", { result: "IMPOSTOR_WIN", impostorUsername: room.impostorUsername });
        }
      }
    }
  });

  socket.on("cursor-move", ({ roomId, position, username }) => {
    socket.to(roomId).emit("cursor-update", { socketId: socket.id, username, position });
  });
});

// 7. DEPLOYMENT: SERVE STATIC REACT FILES
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// 8. START SERVER
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log("🚀 SERVER RUNNING ON PORT 3001 (HTTP)");
});