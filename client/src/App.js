// FILE: client/src/App.js
import React, { useState, useEffect } from "react";
import Intro from "./Intro";
import io from "socket.io-client";
import CodeEditor from "./CodeEditor";
import "./App.css";

const socket = io.connect("http://localhost:3001");

function App() {
  // --- STATE MANAGEMENT (ALL HOOKS FIRST) ---

  const [showIntro, setShowIntro] = useState(true);

  const [view, setView] = useState("login"); // 'login', 'lobby', 'editor'

  // User Info
  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  // Room Info
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [activeRooms, setActiveRooms] = useState([]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    socket.on("join-success", ({ roomId, isHost }) => {
      setRoomId(roomId);
      setIsHost(isHost);
      setView("editor");
    });

    socket.on("error", (message) => {
      alert(message);
    });

    socket.on("room-list", (rooms) => {
      setActiveRooms(rooms);
    });

    return () => {
      socket.off("join-success");
      socket.off("error");
      socket.off("room-list");
    };
  }, []);

  // --- INTRO SCREEN (AFTER ALL HOOKS) ---
  if (showIntro) {
    return <Intro onProceed={() => setShowIntro(false)} />;
  }

  // --- HANDLERS ---

  const handleLogin = () => {
    if (!tempUsername.trim() || !tempPassword.trim()) {
      alert("Identify yourself! Username and Password required.");
      return;
    }
    setUsername(tempUsername);
    setView("lobby");
  };

  const handleRoomAction = () => {
    if (!roomId || !password) {
      alert("Please fill in Room ID and Password!");
      return;
    }
    if (isCreating) {
      socket.emit("create-room", { roomId, username, password });
    } else {
      socket.emit("join-room", { roomId, username, password });
    }
  };

  const handleLeave = () => {
    setView("lobby");
    setRoomId("");
    setIsHost(false);
    setPassword("");
  };

  const handleLogout = () => {
    setView("login");
    setUsername("");
    setTempUsername("");
    setTempPassword("");
  };

  // --- RENDER VIEWS ---

  if (view === "login") {
    return (
      <div className="app-container login-view">
        <div className="login-card">
          <h1>IDENTIFY YOURSELF</h1>

          <div className="input-group">
            <input
              placeholder="Enter Codename..."
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              placeholder="Secret Password..."
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <button className="login-btn" onClick={handleLogin}>
            ENTER SYSTEM
          </button>
        </div>
      </div>
    );
  }

  if (view === "lobby") {
    return (
      <div className="app-container lobby-view">
        <div className="lobby-header">
          <h2>
            Welcome, <span className="highlight">{username}</span>
          </h2>
          <button className="logout-btn" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>

        <div className="lobby-content">
          {/* LEFT */}
          <div className="join-form">
            <div className="form-toggle">
              <button
                className={isCreating ? "active" : ""}
                onClick={() => setIsCreating(true)}
              >
                CREATE MISSION
              </button>
              <button
                className={!isCreating ? "active" : ""}
                onClick={() => setIsCreating(false)}
              >
                JOIN MISSION
              </button>
            </div>

            <input
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <input
              type="password"
              placeholder="Room Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="submit-btn" onClick={handleRoomAction}>
              {isCreating ? "INITIALIZE ROOM" : "CONNECT TO ROOM"}
            </button>
          </div>

          {/* RIGHT */}
          <div className="active-rooms-panel">
            <h3>ACTIVE MISSIONS ({activeRooms.length})</h3>
            <div className="room-list">
              {activeRooms.length === 0 ? (
                <p className="no-rooms">No active missions detected.</p>
              ) : (
                activeRooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="room-card"
                    onClick={() => {
                      setRoomId(room.roomId);
                      setIsCreating(false);
                    }}
                  >
                    <div className="room-header">
                      <span>{room.roomId}</span>
                      <span className="room-lang">{room.language}</span>
                    </div>
                    <div className="room-footer">
                      <span>Host: {room.host}</span>
                      <span>👤 {room.users}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 3: EDITOR
  return (
    <div className="App">
      <CodeEditor
        socket={socket}
        roomId={roomId}
        username={username}
        isHost={isHost}
        onLeave={handleLeave}
      />
    </div>
  );
}

export default App;
