// FILE: server/index.js
const express = require('express');
const http = require('http'); // 🟢 Using HTTP
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

// 🟢 Create HTTP Server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // 🟢 Allows access from Phone/Laptop IPs
    methods: ["GET", "POST"],
  },
});

const rooms = {};

// JDOODLE CONFIGURATION
const JDOODLE_CONFIG = {
  python: { language: "python3", versionIndex: "4" },
  java: { language: "java", versionIndex: "4" },
  c: { language: "c", versionIndex: "5" },
  cpp: { language: "cpp", versionIndex: "5" },
  nodejs: { language: "nodejs", versionIndex: "4" }
};

// --- CREDENTIAL ROTATION (Prevents hitting limits) ---
const API_KEYS = [
  {
    clientId: "cfa368c3611d5a5a2aa6f2ce9f9df889",
    clientSecret: "f7686465d7b2f52c8e3fdfd5f7d3d79aeb0dec44490fd79f5d89825adc618017"
  },
  {
    clientId: "7397db393db95d2eaa3e95fbe68f30e0",
    clientSecret: "9186750c8ad4b8b0630be1882603758d5b88336c152a2d370d183b159d5f2335"
  },
  {
    clientId: "f39ce27c14cb4ac8378f9ae4f22ffaed",
    clientSecret: "1c33ea31a870274f864fc8c94b1ebaca744b55967174050d46be1dd5b96fcc80"
  }
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
  }));
}

io.on("connection", (socket) => {
  // Send initial room list
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

  // --- RUN CODE LOGIC (WITH INPUT FIX) ---
  socket.on("run-code", async ({ roomId, language, code, stdin }) => {
    const config = JDOODLE_CONFIG[language];
    if (!config) {
      io.to(roomId).emit("code-output", "Error: Language not supported.");
      return;
    }

    const { clientId, clientSecret } = getNextCredential();
    console.log(`Executing code using Key ending in ...${clientId.slice(-4)}`);

    try {
      io.to(roomId).emit("code-output", "Running code...");

      const response = await axios.post("https://api.jdoodle.com/v1/execute", {
        clientId: clientId,
        clientSecret: clientSecret,
        script: code,
        // 🟢 FIX: Ensure stdin is a string. If null/undefined, use empty string.
        stdin: stdin ? String(stdin) : "", 
        language: config.language,
        versionIndex: config.versionIndex
      });

      const { output, statusCode, memory, cpuTime } = response.data;
      const finalOutput = `${output}\n\n[Execution Info]\nStatus: ${statusCode}\nMemory: ${memory || 0}kb\nCPU: ${cpuTime || 0}s`;

      io.to(roomId).emit("code-output", finalOutput);

    } catch (error) {
      console.error("Error:", error.message);
      io.to(roomId).emit("code-output", "Error executing code.");
    }
  });
// --- SUBMIT CODE (Batch Execution) ---
  socket.on("submit-code", async ({ roomId, language, code, stdin }) => {
    const config = JDOODLE_CONFIG[language];
    if (!config) {
      io.to(roomId).emit("submit-result", { success: false, output: "Error: Language not supported." });
      return;
    }

    const { clientId, clientSecret } = getNextCredential();
    console.log(`Submitting code using Key ending in ...${clientId.slice(-4)}`);

    try {
      const response = await axios.post("https://api.jdoodle.com/v1/execute", {
        clientId: clientId,
        clientSecret: clientSecret,
        script: code,
        stdin: stdin, // The BATCH input string
        language: config.language,
        versionIndex: config.versionIndex
      });

      // Send back ONLY the raw output for comparison
      io.to(roomId).emit("submit-result", { 
        success: true, 
        output: response.data.output,
        memory: response.data.memory,
        cpuTime: response.data.cpuTime
      });

    } catch (error) {
      console.error("JDoodle Error:", error.message);
      io.to(roomId).emit("submit-result", { success: false, output: "Execution Error" });
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
      for (const roomId in rooms) {
        const index = rooms[roomId].users.findIndex(u => u.id === socket.id);
        if (index !== -1) removeUserFromRoom(roomId, socket.id);
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
    socket.to(roomId).emit("cursor-update", { 
      socketId: socket.id, 
      username, 
      position 
    });
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001 (HTTP)");
});