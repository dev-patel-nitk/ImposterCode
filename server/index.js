// FILE: server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose'); 
const multer = require('multer');     
const path = require('path');         
const fs = require('fs');             

const app = express();
app.use(cors());
app.use(express.json()); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI = "mongodb://127.0.0.1:27017/imposter_code"; 
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ DATABASE CONNECTED"))
  .catch(err => console.log("❌ DB CONNECTION ERROR:", err));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  photo: { type: String, default: "" },
  isGuest: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

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
const upload = multer({ storage });

// --- REST API ---
app.get('/api/users/search', async (req, res) => {
  const { q } = req.query;
  try {
    const users = await User.find({ username: { $regex: q, $options: 'i' } }).limit(5).select('username photo');
    res.json(users);
  } catch (err) { res.status(500).json({ error: "Search failed" }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, isGuest } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username, isGuest });
      await user.save();
    }
    res.json(user);
  } catch (err) { res.status(500).json({ error: "Auth failed" }); }
});

app.post('/api/users/upload', upload.single('photo'), async (req, res) => {
  const { username } = req.body;
  const photoUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  try {
    const updatedUser = await User.findOneAndUpdate({ username }, { photo: photoUrl }, { new: true });
    res.json({ success: true, photoUrl: updatedUser.photo });
  } catch (err) { res.status(500).json({ error: "Upload failed" }); }
});

// --- SOCKET SERVER ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const rooms = {};

const JDOODLE_CONFIG = {
  python: { language: "python3", versionIndex: "4" },
  java: { language: "java", versionIndex: "4" },
  c: { language: "c", versionIndex: "5" },
  cpp: { language: "cpp", versionIndex: "5" },
  nodejs: { language: "nodejs", versionIndex: "4" }
};

const API_KEYS = [
  { clientId: "cfa368c3611d5a5a2aa6f2ce9f9df889", clientSecret: "f7686465d7b2f52c8e3fdfd5f7d3d79aeb0dec44490fd79f5d89825adc618017" }
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
      gameStatus: "waiting", // Default state
      duration: 600,
      impostorId: null
    };
    joinRoomLogic(socket, roomId, username);
    console.log(`[CREATE] Room ${roomId} created by ${username}`);
    io.emit("room-list", getAllRooms());
  });

  socket.on("join-room", ({ roomId, username, password }) => {
    const room = rooms[roomId];
    
    // 1. Check Existence
    if (!room) {
      socket.emit("error", "Room does not exist!");
      return;
    }
    
    // 2. Check Capacity
    if (room.users.length >= 6) {
      socket.emit("error", "Room is full! (Max 6 players)");
      return;
    }

    // 3. Check Game Status (with fallback for safety)
    const currentStatus = room.gameStatus || "waiting"; 
    if (currentStatus !== "waiting") {
      socket.emit("error", "Mission in progress! Access Locked.");
      return;
    }

    // 4. Check Password
    if (room.password !== password) {
      socket.emit("error", "Incorrect Password!");
      return;
    }

    joinRoomLogic(socket, roomId, username);
    console.log(`[JOIN] ${username} joined room ${roomId}`);
  });

  socket.on("start-game", ({ roomId, duration }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id) return;

    room.gameStatus = "running";
    room.duration = duration * 60;
    
    const playerCount = room.users.length;
    room.impostorId = null;

    if (playerCount >= 3) {
      const randomIndex = Math.floor(Math.random() * playerCount);
      room.impostorId = room.users[randomIndex].id;
    }

    io.to(roomId).emit("game-started", { 
      duration: room.duration, 
      impostorId: room.impostorId 
    });
    
    io.emit("room-list", getAllRooms());
    console.log(`[START] Game started in ${roomId} (Impostor ID: ${room.impostorId})`);
  });

  socket.on("timer-tick", ({ roomId, timeLeft }) => {
    if (rooms[roomId]) {
      socket.to(roomId).emit("timer-update", timeLeft);
      if (timeLeft <= 0) {
        rooms[roomId].gameStatus = "finished";
        io.to(roomId).emit("game-over");
      }
    }
  });

  socket.on("run-code", async ({ roomId, language, code, stdin }) => {
    const config = JDOODLE_CONFIG[language];
    if (!config) return io.to(roomId).emit("code-output", "Language not supported.");
    
    const { clientId, clientSecret } = getNextCredential();
    try {
      io.to(roomId).emit("code-output", "Running code...");
      const response = await axios.post("https://api.jdoodle.com/v1/execute", {
        clientId, clientSecret, script: code, stdin: stdin || "", 
        language: config.language, versionIndex: config.versionIndex
      });
      io.to(roomId).emit("code-output", response.data.output);
    } catch (error) { io.to(roomId).emit("code-output", "Execution Error"); }
  });

  // ... (Submit code logic stays same as before) ...

  socket.on("send-chat-message", ({ roomId, message, username }) => {
    io.to(roomId).emit("receive-chat-message", { message, username });
  });

  function joinRoomLogic(socket, roomId, username) {
    socket.join(roomId);
    // Prevent duplicate entries if logic misfires
    if (!rooms[roomId].users.find(u => u.id === socket.id)) {
      rooms[roomId].users.push({ id: socket.id, username });
    }
    
    const isHost = rooms[roomId].hostId === socket.id;
    socket.emit("join-success", { roomId, isHost });
    socket.emit("code-update", rooms[roomId].code);
    socket.emit("language-update", rooms[roomId].language);
    
    io.to(roomId).emit("user-list-update", rooms[roomId].users);
    io.emit("room-list", getAllRooms());
  }

  // ... (Keep code-change, language-change, typing listeners) ...

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
      // Find all rooms this socket is in
      for (const roomId in rooms) {
        if (specificRoomId && roomId !== specificRoomId) continue;

        const index = rooms[roomId].users.findIndex(u => u.id === socket.id);
        if (index !== -1) {
          rooms[roomId].users.splice(index, 1);
          
          // If room is empty, delete it
          if (rooms[roomId].users.length === 0) {
            delete rooms[roomId];
          } else {
            // Reassign host if host left
            if (rooms[roomId].hostId === socket.id) {
               rooms[roomId].hostId = rooms[roomId].users[0].id;
            }
            io.to(roomId).emit("user-list-update", rooms[roomId].users);
          }
          io.emit("room-list", getAllRooms());
        }
      }
  }

  // ... (Keep cursor-move) ...
});

server.listen(3001, () => {
  console.log("🚀 SERVER RUNNING ON PORT 3001");
});