// FILE: server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = {};
const PISTON_RUNTIMES = {
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  c: { language: "c", version: "10.2.0" },
  cpp: { language: "c++", version: "10.2.0" },
};

// Helper: Get formatted room list
function getAllRooms() {
  return Object.keys(rooms).map((r) => ({
    roomId: r,
    users: rooms[r].users.length,
    language: rooms[r].language,
    host: rooms[r].users.find((u) => u.id === rooms[r].hostId)?.username || "Unknown",
  }));
}

io.on("connection", (socket) => {
  // Send room list immediately upon connection
  socket.emit("room-list", getAllRooms());

  // --- FIX START: Add this block ---
  socket.on("sync-users", ({ roomId }) => {
    if (rooms[roomId]) {
      // Send the latest user list to the specific user who asked
      socket.emit("user-list-update", rooms[roomId].users);
    }
  });
  // --- FIX END ---

  socket.on("create-room", ({ roomId, username, password }) => {
    if (rooms[roomId]) {
      socket.emit("error", "Room already exists! Please join instead.");
      return;
    }
    rooms[roomId] = {
      code: "// Start coding here...",
      language: "python",
      password: password,
      hostId: socket.id,
      users: []
    };
    joinRoomLogic(socket, roomId, username);
    io.emit("room-list", getAllRooms()); 
  });

  socket.on("join-room", ({ roomId, username, password }) => {
    if (!rooms[roomId]) {
      socket.emit("error", "Room does not exist!");
      return;
    }
    if (rooms[roomId].password !== password) {
      socket.emit("error", "Incorrect Password!");
      return;
    }
    joinRoomLogic(socket, roomId, username);
  });

  socket.on("run-code", async ({ roomId, language, code }) => {
    const runtime = PISTON_RUNTIMES[language];
    if (!runtime) return;
    try {
      io.to(roomId).emit("code-output", "Running code...");
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: runtime.language,
        version: runtime.version,
        files: [{ content: code }],
      });
      io.to(roomId).emit("code-output", response.data.run.output || "No output.");
    } catch (error) {
      socket.emit("code-output", "Error executing code.");
    }
  });

  socket.on("send-chat-message", ({ roomId, message, username }) => {
    io.to(roomId).emit("receive-chat-message", { message, username });
  });

  function joinRoomLogic(socket, roomId, username) {
    socket.join(roomId);
    rooms[roomId].users.push({ id: socket.id, username });
    
    const isHost = rooms[roomId].hostId === socket.id;
    socket.emit("join-success", { roomId, isHost });
    socket.emit("code-update", rooms[roomId].code);
    socket.emit("language-update", rooms[roomId].language);
    io.to(roomId).emit("user-list-update", rooms[roomId].users);
    io.emit("room-list", getAllRooms()); 
  }

  socket.on("code-change", ({ roomId, code }) => {
    if (rooms[roomId]) {
      rooms[roomId].code = code;
      socket.to(roomId).emit("code-update", code);
    }
  });

  socket.on("language-change", ({ roomId, language }) => {
    if (rooms[roomId]) {
      rooms[roomId].language = language;
      io.to(roomId).emit("language-update", language);
      io.emit("room-list", getAllRooms()); 
    }
  });

  socket.on("typing", ({ roomId, username }) => {
    socket.to(roomId).emit("user-typing", username);
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
    if (specificRoomId && rooms[specificRoomId]) {
      socket.leave(specificRoomId);
      removeUserFromRoom(specificRoomId, socket.id);
      return;
    }
    // Scan all rooms if simple disconnect
    for (const roomId in rooms) {
      const index = rooms[roomId].users.findIndex(u => u.id === socket.id);
      if (index !== -1) {
        removeUserFromRoom(roomId, socket.id);
      }
    }
  }

  function removeUserFromRoom(roomId, socketId) {
    if (!rooms[roomId]) return;
    const index = rooms[roomId].users.findIndex(u => u.id === socketId);
    if (index !== -1) {
      rooms[roomId].users.splice(index, 1);
      io.to(roomId).emit("user-list-update", rooms[roomId].users);
      io.emit("room-list", getAllRooms()); 
    }
  }
  socket.on("cursor-move", ({ roomId, position, username }) => {
    // Broadcast to everyone else in the room immediately
    socket.to(roomId).emit("cursor-update", { 
      socketId: socket.id, 
      username, 
      position 
    });
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});