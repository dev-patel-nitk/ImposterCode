// FILE: server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ================= STATIC =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= DB =================
mongoose
  .connect("mongodb://127.0.0.1:27017/imposter_code")

  .then(() => console.log("✅ DATABASE CONNECTED"))
  .catch((err) => console.error("❌ DB ERROR:", err));

// ================= USER MODEL =================
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  photo: { type: String, default: "" },
  isGuest: { type: Boolean, default: false },
});
const User = mongoose.model("User", userSchema);

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ================= REST =================
app.get("/api/users/search", async (req, res) => {
  const { q } = req.query;
  const users = await User.find({
    username: { $regex: q, $options: "i" },
  })
    .limit(5)
    .select("username photo");
  res.json(users);
});

app.post("/api/auth/login", async (req, res) => {
  const { username, isGuest } = req.body;
  let user = await User.findOne({ username });
  if (!user) {
    user = new User({ username, isGuest });
    await user.save();
  }
  res.json(user);
});

app.post("/api/users/upload", upload.single("photo"), async (req, res) => {
  const photoUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  const user = await User.findOneAndUpdate(
    { username: req.body.username },
    { photo: photoUrl },
    { new: true },
  );
  res.json({ photoUrl: user.photo });
});

// ================= SERVER =================
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ================= GAME STATE =================
const rooms = {};

// ================= HELPERS =================
function getAllRooms() {
  return Object.keys(rooms).map((id) => ({
    roomId: id,
    users: rooms[id].users.length,
    language: rooms[id].language,
    host:
      rooms[id].users.find((u) => u.id === rooms[id].hostId)?.username ||
      "Unknown",
    gameStatus: rooms[id].gameStatus,
  }));
}

// ================= SOCKET =================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("room-list", getAllRooms());

  socket.on("sync-users", ({ roomId }) => {
    if (rooms[roomId]) socket.emit("user-list-update", rooms[roomId].users);
  });

  socket.on("create-room", ({ roomId, username, password }) => {
    if (rooms[roomId]) {
      socket.emit("error", "Room already exists");
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
    };

    joinRoom(socket, roomId, username);
    io.emit("room-list", getAllRooms());
  });

  socket.on("join-room", ({ roomId, username, password }) => {
    const room = rooms[roomId];
    if (!room) return socket.emit("error", "Room not found");
    if (room.password !== password)
      return socket.emit("error", "Wrong password");
    if (room.users.length >= 6) return socket.emit("error", "Room full");
    if (room.gameStatus !== "waiting")
      return socket.emit("error", "Game already started");

    joinRoom(socket, roomId, username);
  });

  socket.on("start-game", ({ roomId, duration }) => {
    const room = rooms[roomId];
    if (!room || room.hostId !== socket.id) return;

    room.gameStatus = "running";
    room.duration = duration * 60;

    if (room.users.length >= 3) {
      const idx = Math.floor(Math.random() * room.users.length);
      room.impostorId = room.users[idx].id;
    }

    io.to(roomId).emit("game-started", {
      duration: room.duration,
      impostorId: room.impostorId,
    });

    io.emit("room-list", getAllRooms());
  });

  socket.on("timer-tick", ({ roomId, timeLeft }) => {
    if (!rooms[roomId]) return;
    socket.to(roomId).emit("timer-update", timeLeft);
    if (timeLeft <= 0) triggerGameOver(roomId);
  });

  socket.on("end-game", ({ roomId }) => {
    triggerGameOver(roomId);
  });

  socket.on("leave-room", ({ roomId }) => leaveRoom(socket, roomId));
  socket.on("disconnect", () => leaveRoom(socket));

  socket.on("cursor-move", ({ roomId, position, username }) => {
    socket.to(roomId).emit("cursor-update", {
      socketId: socket.id,
      username,
      position,
    });
  });
});

// ================= GAME FUNCTIONS =================
function triggerGameOver(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  // CASE 1: Less than 3 players → General message only
  if (room.users.length < 3) {
    io.to(roomId).emit("game-over", {
      type: "NO_RESULT",
      message: "Not enough players. Game ended without a winner.",
    });
    return;
  }

  // CASE 2: 3 or more players → Proper result
  let result = "CREWMATE_WIN";
  if (room.impostorId) {
    result = "IMPOSTOR_WIN";
  }

  const roles = room.users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.id === room.impostorId ? "IMPOSTOR" : "CREWMATE",
  }));

  room.gameStatus = "finished";

  io.to(roomId).emit("game-over", {
    type: "RESULT",
    result,
    roles,
  });

  io.emit("room-list", getAllRooms());
}

function joinRoom(socket, roomId, username) {
  socket.join(roomId);
  rooms[roomId].users.push({ id: socket.id, username });

  socket.emit("join-success", {
    roomId,
    isHost: rooms[roomId].hostId === socket.id,
  });

  io.to(roomId).emit("user-list-update", rooms[roomId].users);
}

function leaveRoom(socket, roomId = null) {
  for (const id in rooms) {
    if (roomId && id !== roomId) continue;
    const idx = rooms[id].users.findIndex((u) => u.id === socket.id);
    if (idx !== -1) {
      rooms[id].users.splice(idx, 1);
      io.to(id).emit("user-list-update", rooms[id].users);
      if (rooms[id].users.length === 0) delete rooms[id];
    }
  }
  io.emit("room-list", getAllRooms());
}

// ================= START =================
server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});
