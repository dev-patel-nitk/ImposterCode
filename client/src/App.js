// FILE: client/src/App.js
import React, { useState, useEffect } from "react";
import Intro from "./Intro";
import io from "socket.io-client";
import CodeEditor from "./CodeEditor";
import ProfileView from "./ProfileView"; 
import axios from "axios"; 
import "./App.css";

const socket = io(process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:3001');
// 🟢 THEMED DEFAULT IMAGE
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/3242/3242257.png";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [view, setView] = useState("login"); 

  // --- USER & PROFILE STATE ---
  const [user, setUser] = useState(null); 
  const [tempUsername, setTempUsername] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // --- ROOM STATE ---
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [activeRooms, setActiveRooms] = useState([]);

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    socket.on("join-success", ({ roomId, isHost }) => {
      setRoomId(roomId);
      setIsHost(isHost);
      setView("editor");
    });
    
    // 🟢 Handle Server Errors (e.g., "Room Full", "Game Started")
    socket.on("error", (msg) => alert(msg));
    
    socket.on("room-list", (rooms) => setActiveRooms(rooms));

    return () => {
      socket.off("join-success");
      socket.off("error");
      socket.off("room-list");
    };
  }, []);

  // --- SEARCH LOGIC (Debounced) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await axios.get(`/api/users/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (err) { console.error("Search failed", err); }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  if (showIntro) return <Intro onProceed={() => setShowIntro(false)} />;

  // --- HANDLERS ---

  const handleAuth = async (name, isGuest = false) => {
    if (!name.trim()) return alert("Identify yourself, Crewmate!");
    try {
      const res = await axios.post("/api/auth/login", { 
        username: name, 
        isGuest 
      });
      setUser(res.data);
      setView("lobby");
    } catch (err) {
      alert("Database Connection Failed. Check server.");
    }
  };

  const handleOpenProfile = (crewmate) => {
    setSelectedProfile(crewmate);
    setView("profile");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("username", user.username);

    try {
      const res = await axios.post("/api/users/upload", formData);
      const updatedUser = { ...user, photo: res.data.photoUrl };
      setUser(updatedUser);
      setSelectedProfile(updatedUser); 
      alert("Profile Identity Updated!");
    } catch (err) {
      alert("Upload Failed.");
    }
  };

  const handleRoomAction = () => {
    if (!roomId || !password) {
      alert("Please fill in Room ID and Password!");
      return;
    }

    // 🟢 CONNECTION CHECK: Fixes "button not working" issue
    if (!socket.connected) {
      alert("Connection to Mainframe lost! Refreshing...");
      window.location.reload();
      return;
    }

    if (isCreating) {
      socket.emit("create-room", { roomId, username: user.username, password });
    } else {
      socket.emit("join-room", { roomId, username: user.username, password });
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
    setUser(null);
    setTempUsername("");
  };

  // --- RENDER VIEWS ---

  if (view === "login") {
    return (
      <div className="app-container login-view">
        <div className="login-card">
          <h1>IDENTIFICATION REQUIRED</h1>
          <div className="input-group">
            <input
              placeholder="Enter Codename..."
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAuth(tempUsername, false)}
            />
            <button className="login-btn" onClick={() => handleAuth(tempUsername, false)}>
              SIGN IN
            </button>
          </div>
          <div className="login-divider"><span>OR</span></div>
          <button 
            className="login-btn guest-mode" 
            onClick={() => handleAuth(`#guest${Math.floor(100000 + Math.random() * 900000)}`, true)}
          >
            PLAY AS GUEST
          </button>
        </div>
      </div>
    );
  }

  if (view === "lobby") {
    return (
      <div className="app-container lobby-view">
        <div className="lobby-header">
          <h2 onClick={() => handleOpenProfile(user)} style={{ cursor: 'pointer' }}>
            Welcome, <span className="highlight">{user?.username}</span>
          </h2>
          <button className="logout-btn" onClick={handleLogout}>LOGOUT</button>
        </div>

        <div className="lobby-content">
          <div className="lobby-left-panel">
            <div className="search-section">
              <input 
                className="search-bar"
                placeholder="Find Crewmates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="search-results-overlay">
                  {searchResults.map((u) => (
                    <div key={u._id} className="search-item" onClick={() => handleOpenProfile(u)}>
                      <div className="search-item-left">
                        <img 
                          src={u.photo || DEFAULT_AVATAR} 
                          alt="thumb" 
                          className="search-thumb" 
                        />
                        <span>{u.username}</span>
                      </div>
                      <small>VIEW DOSSIER ➔</small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="join-form">
              <div className="form-toggle">
                <button className={isCreating ? "active" : ""} onClick={() => setIsCreating(true)}>CREATE MISSION</button>
                <button className={!isCreating ? "active" : ""} onClick={() => setIsCreating(false)}>JOIN MISSION</button>
              </div>
              <input placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
              <input type="password" placeholder="Room Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="submit-btn" onClick={handleRoomAction}>
                {isCreating ? "INITIALIZE" : "CONNECT"}
              </button>
            </div>
          </div>

          <div className="active-rooms-panel">
            <h3>ACTIVE MISSIONS ({activeRooms.length})</h3>
            <div className="room-list">
              {activeRooms.length === 0 ? (
                <p className="no-rooms">No active missions detected.</p>
              ) : (
                activeRooms.map((room) => (
                  <div key={room.roomId} className="room-card" onClick={() => { setRoomId(room.roomId); setIsCreating(false); }}>
                    <div className="room-header">
                      <span>{room.roomId}</span>
                      <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                        {/* 🟢 Status Indicator: Shows if room is locked */}
                        {room.gameStatus === 'running' && (
                          <span style={{fontSize: '0.6rem', background: 'var(--neon-red)', color: 'white', padding: '2px 6px', borderRadius: '4px'}}>
                            PLAYING
                          </span>
                        )}
                        <span className="room-lang">{room.language}</span>
                      </div>
                    </div>
                    <div className="room-footer">
                      <span>Host: {room.host}</span>
                      <span>👤 {room.users} / 6</span>
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

  if (view === "profile") {
    return (
      <ProfileView 
        crewmate={selectedProfile} 
        onBack={() => setView("lobby")} 
        isOwnProfile={selectedProfile?.username === user?.username} 
        onUpload={handlePhotoUpload} 
      />
    );
  }

  return (
    <div className="App">
      <CodeEditor
        socket={socket}
        roomId={roomId}
        username={user?.username}
        isHost={isHost}
        onLeave={handleLeave}
      />
    </div>
  );
}

export default App;