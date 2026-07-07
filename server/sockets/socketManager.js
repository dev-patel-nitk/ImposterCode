const axios = require('axios');
const { pool } = require('../db');

const JDOODLE_CONFIG = {
  python: { language: "python3", versionIndex: "4" },
  java: { language: "java", versionIndex: "4" },
  c: { language: "c", versionIndex: "5" },
  cpp: { language: "cpp", versionIndex: "5" },
  nodejs: { language: "nodejs", versionIndex: "4" }
};

let currentKeyIndex = 0;
function getNextCredential() {
  const API_KEYS = [
    { clientId: process.env.JDOODLE_CLIENT_ID_1, clientSecret: process.env.JDOODLE_CLIENT_SECRET_1 },
    { clientId: process.env.JDOODLE_CLIENT_ID_2, clientSecret: process.env.JDOODLE_CLIENT_SECRET_2 },
    { clientId: process.env.JDOODLE_CLIENT_ID_3, clientSecret: process.env.JDOODLE_CLIENT_SECRET_3 }
  ].filter(key => key.clientId && key.clientSecret);
  
  if (API_KEYS.length === 0) return { clientId: "", clientSecret: "" };

  const credential = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return credential;
}

let botIntervals = {}; // Keeps track of interval IDs per bot

const formatInputForExecution = (input) => {
    if (typeof input === 'object') return JSON.stringify(input);
    return String(input);
};

const normalizeOutput = (out) => {
    if (out === null || out === undefined) return "";
    let cleaned = String(out).toLowerCase().trim();
    if (cleaned === "true" || cleaned === "true.") return "1";
    if (cleaned === "false" || cleaned === "false.") return "0";
    return cleaned;
};

const normalizeExpected = (out) => {
    if (out === null || out === undefined) return "";
    return String(out).toLowerCase().trim();
};

const botManager = require('./botManager');

module.exports = function(io, ysocketio) {
  const rooms = {};

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

  io.on("connection", (socket) => {
    socket.emit("room-list", getAllRooms());

    socket.on("sync-users", ({ roomId }) => {
      if (rooms[roomId]) socket.emit("user-list-update", rooms[roomId].users);
    });

    socket.on("add-bot", ({ roomId }) => {
      botManager.addBot(roomId, io, ysocketio, rooms);
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
      
      const sanitizedQuestion = { ...room.activeQuestion };
      delete sanitizedQuestion.testCases;

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
        questionData: sanitizedQuestion 
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
      if (!clientId) {
        return io.to(roomId).emit("code-output", "JDoodle API Keys not configured in .env");
      }
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

    socket.on("submit-code", async ({ roomId, language, code }) => {
      const room = rooms[roomId];
      if (room?.kickedIds.includes(socket.id)) {
          io.to(roomId).emit("submit-result", { success: false, output: "🚫 EJECTED USERS CANNOT SUBMIT." });
          return;
      }
      if (!room || !room.activeQuestion || !room.activeQuestion.testCases) {
          io.to(roomId).emit("submit-result", { success: false, output: "No active question found." });
          return;
      }
      
      const config = JDOODLE_CONFIG[language];
      if (!config) return io.to(roomId).emit("submit-result", { success: false, output: "Error." });
      
      const { clientId, clientSecret } = getNextCredential();
      if (!clientId) {
        return io.to(roomId).emit("submit-result", { success: false, output: "JDoodle API Keys not configured in .env" });
      }
      
      try {
        const testCases = room.activeQuestion.testCases;
        const t = testCases.length;
        const inputs = testCases.map(tc => formatInputForExecution(tc.input));
        const fullStdin = `${t}\n` + inputs.join('\n');
        
        const response = await axios.post("https://api.jdoodle.com/v1/execute", {
          clientId, clientSecret, script: code, stdin: fullStdin, 
          language: config.language, versionIndex: config.versionIndex
        });
        
        const rawOutput = response.data.output;
        const cpuTime = response.data.cpuTime;
        const timeTaken = parseFloat(cpuTime);
        if (timeTaken > 0.2) {
          return io.to(roomId).emit("submit-result", { success: false, output: `⏳ TIME LIMIT EXCEEDED\n=============================\nExecution Time: ${timeTaken} seconds.\nMax Allowed: 1.0 seconds.\n\nYour algorithm is too slow! Optimize to O(N) or O(N log N).` });
        }

        const lines = String(rawOutput).split('\n').filter(l => l.trim() !== '');
        let log = `📊 SUBMISSION RESULTS\n=============================\n⏱️ Time: ${timeTaken}s\n\n--- AUTOMATED GRADING RESULT ---\n`;
        let passedCount = 0;
        
        testCases.forEach((tc, index) => {
            let userLine = lines[index] || "";
            let normUser = normalizeOutput(userLine);
            let normExpected = normalizeExpected(tc.output);
            if (normUser === normExpected) { passedCount++; }
            else { log += `Test Case ${index + 1} Failed: Expected '${normExpected}', Got '${normUser}'\n`; }
        });
        
        log += `=============================\nScore: ${passedCount} / ${testCases.length} Passed\n`;
        
        const isSuccess = passedCount === testCases.length;
        if (isSuccess) {
            log += "\n✅ ALL TESTS PASSED! CODE ACCEPTED.";
            // If success, user wins!
            const user = room.users.find(u => u.id === socket.id);
            if (user) io.to(roomId).emit("send-chat-message", { message: `has completed the task in ${cpuTime}s!`, username: user.username });
        } else {
            log += "\n❌ TESTS FAILED. KEEP TRYING.";
        }
        
        io.to(roomId).emit("submit-result", { 
          success: isSuccess, output: log, memory: response.data.memory, cpuTime 
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
      
      if (rooms[roomId].activeQuestion) {
        const sanitizedQuestion = { ...rooms[roomId].activeQuestion };
        delete sanitizedQuestion.testCases;
        socket.emit("question-update", sanitizedQuestion); 
      } else {
        socket.emit("question-update", null); 
      }
      
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
          await pool.query(`
            UPDATE users 
            SET 
              xp = xp + 10,
              stats = jsonb_set(
                stats,
                '{crewmate,wins}',
                (COALESCE((stats->'crewmate'->>'wins')::int, 0) + 1)::text::jsonb
              )
            WHERE username = ANY($1::varchar[])
          `, [crewUsernames]);
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
                await pool.query(`
              UPDATE users 
              SET 
                xp = xp + 25,
                stats = jsonb_set(
                  stats,
                  '{imposter,wins}',
                  (COALESCE((stats->'imposter'->>'wins')::int, 0) + 1)::text::jsonb
                )
              WHERE username = $1
            `, [room.impostorUsername]);
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
};
