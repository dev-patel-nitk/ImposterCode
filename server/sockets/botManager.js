const { GoogleGenAI } = require('@google/genai');

let ai;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  console.log("⚠️ GEMINI_API_KEY not configured. AI Bots will not type.");
}

const botBrainIntervals = {};
const botTypingIntervals = {};
const roomQueues = {};

async function generateBotCode(code, question, role, language) {
  if (!ai) return null;
  const isImpostor = role === "Impostor";
  const prompt = `You are playing a collaborative coding game.
Role: ${isImpostor ? "Impostor (Secretly sabotage the code with a subtle bug)" : "Crewmate (Help solve the problem correctly)"}
Language: ${language}
Problem Statement:
${question ? question.title + "\\n" + question.description : "No problem provided, just write valid code."}

Current Code:
${code}

Task: Write the next 1-3 lines of code to continue the solution.
${isImpostor ? "CRITICAL: Introduce a VERY SUBTLE logic error or off-by-one bug that looks correct at first glance." : "Ensure the code is correct and follows standard practices."}
IMPORTANT: Only output the raw code snippet that should be appended/inserted. No markdown, no explanation, no \`\`\`.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Bot AI Error:", error);
    return "ERROR";
  }
}

function addBot(roomId, io, ysocketio, rooms) {
  const room = rooms[roomId];
  if (!room) return;
  if (room.users.length >= 6) return;

  const botId = `bot-${Date.now()}`;
  const botName = `AI_Bot_${Math.floor(Math.random() * 1000)}`;
  
  room.users.push({ id: botId, username: botName, isBot: true });
  io.to(roomId).emit("user-list-update", room.users);

  if (!ai) {
    io.to(roomId).emit("receive-message", { username: "SYSTEM", text: `Warning: ${botName} added, but GEMINI_API_KEY is missing/invalid. AI will not function.`, timestamp: new Date() });
  }
  io.emit("room-list", Object.keys(rooms).map((r) => ({
    roomId: r,
    users: rooms[r].users.length,
    language: rooms[r].language,
    host: rooms[r].users.find((u) => u.id === rooms[r].hostId)?.username || "Unknown",
    gameStatus: rooms[r].gameStatus 
  })));

  if (!roomQueues[roomId]) roomQueues[roomId] = [];

  // --- 1. PRODUCER (THE BRAIN) ---
  if (!botBrainIntervals[roomId]) {
    botBrainIntervals[roomId] = setInterval(async () => {
      const currentRoom = rooms[roomId];
      if (!currentRoom || currentRoom.gameStatus !== "running") return;

      const bots = currentRoom.users.filter(u => u.isBot);
      if (bots.length === 0) {
        clearInterval(botBrainIntervals[roomId]);
        delete botBrainIntervals[roomId];
        return;
      }

      // If there's already a lot of code buffered, wait.
      if (roomQueues[roomId].length > 50) return;

      // Pick a random bot to dictate the "role" of the code (Impostor vs Crewmate)
      const actingBot = bots[Math.floor(Math.random() * bots.length)];
      if (currentRoom.kickedIds.includes(actingBot.id)) return;

      let myRole = currentRoom.impostorId === actingBot.id ? "Impostor" : "Crewmate";

      const ydoc = ysocketio.documents.get(roomId);
      if (!ydoc) {
        console.log(`[BOT BRAIN] No ydoc found for room ${roomId}`);
        return;
      }
      const ytext = ydoc.getText("monaco");
      const currentCode = ytext.toString();

      console.log(`[BOT BRAIN] Generating code for ${actingBot.username} in room ${roomId}...`);
      let newCode = await generateBotCode(currentCode, currentRoom.activeQuestion, myRole, currentRoom.language);
      
      if (newCode === "ERROR") {
        console.log(`[BOT BRAIN] Failed to generate code. Ejecting bot ${actingBot.username} to prevent spam.`);
        if (!currentRoom.kickedIds.includes(actingBot.id)) {
          currentRoom.kickedIds.push(actingBot.id);
          io.to(roomId).emit("receive-message", { username: "SYSTEM", text: `${actingBot.username} malfunctioned (API Error/Quota Exceeded) and was disabled.`, timestamp: new Date() });
          io.to(roomId).emit("user-list-update", currentRoom.users); // Refresh to show ejected state if necessary
        }
        return;
      }

      if (!newCode) {
        console.log(`[BOT BRAIN] Failed to generate code!`);
        return;
      }
      console.log(`[BOT BRAIN] Generated ${newCode.length} characters.`);
      
      // Fix the literal '\\n' output bug by safely replacing all occurrences
      newCode = newCode.replace(/\\n/g, '\n');
      
      // Add newline at the end so next chunk starts fresh
      newCode += "\n";

      // Push characters into the room's queue
      for (const char of newCode) {
        roomQueues[roomId].push(char);
      }

    }, 25000); // Brain thinks every 25 seconds
  }

  // --- 2. CONSUMER (THE HIVE-MIND TYPIST) ---
  if (!botTypingIntervals[roomId]) {
    let currentBotIndex = 0;

    botTypingIntervals[roomId] = setInterval(() => {
      const currentRoom = rooms[roomId];
      if (!currentRoom || currentRoom.gameStatus !== "running") return;

      const bots = currentRoom.users.filter(u => u.isBot && !currentRoom.kickedIds.includes(u.id));
      if (bots.length === 0) {
        clearInterval(botTypingIntervals[roomId]);
        delete botTypingIntervals[roomId];
        return;
      }

      if (roomQueues[roomId].length > 0) {
        const char = roomQueues[roomId].shift();
        
        // Rotate through available bots for collaborative typing
        currentBotIndex = (currentBotIndex + 1) % bots.length;
        const typingBot = bots[currentBotIndex];

        const ydoc = ysocketio.documents.get(roomId);
        if (!ydoc) return;
        const ytext = ydoc.getText("monaco");

        try {
          ytext.insert(ytext.length, char);
          io.to(roomId).emit("user-typing", { username: typingBot.username, color: "#FF00FF" });
        } catch (err) {
          // Document reset/error
          roomQueues[roomId] = [];
        }
      }
    }, 120); // Slower, synchronized typing speed (120ms per character)
  }
}

module.exports = { addBot };
