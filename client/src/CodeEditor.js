// FILE: client/src/CodeEditor.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
// 🟢 NEW IMPORTS FOR REAL-TIME COLLAB
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { MonacoBinding } from "y-monaco";

import Chat from "./Chat";
import VoiceChat from "./VoiceChat";
import { DSA_QUESTIONS } from "./dsaQuestions"; 
import QuestionPanel from "./QuestionPanel";
import EmergencyMeeting from "./EmergencyMeeting"; 
import RoleReveal from "./RoleReveal"; 
import { formatInputForExecution, normalizeOutput, normalizeExpected } from "./testUtils"; 

const BOILERPLATES = {
  python: `import sys\n\ndef solve():\n    # inputs\n    # *your solution*\n    pass\n\nif __name__ == "__main__":\n    try:\n        # Read all input to handle newlines strictly like cin >>\n        input_data = sys.stdin.read().split()\n        if input_data:\n            iterator = iter(input_data)\n            tc = int(next(iterator))\n            for _ in range(tc):\n                solve()\n    except Exception:\n        pass`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void solve(Scanner sc) {\n        // inputs\n        // *your solution*\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int tc = sc.nextInt();\n            while (tc-- > 0) {\n                solve(sc);\n            }\n        }\n    }\n}`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve(){\n    //inputs\n    //*your solution*\n}\n\nint main() {\n    int tc;\n    if (cin >> tc) {\n        while(tc--) solve();\n    }\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nvoid solve() {\n    // inputs\n    // *your solution*\n}\n\nint main() {\n    int tc;\n    if (scanf("%d", &tc) == 1) {\n        while (tc--) {\n            solve();\n        }\n    }\n    return 0;\n}`,
};

const CodeEditor = ({ socket, roomId, username, isHost, onLeave }) => {
  // --- STATE ---
  const [language, setLanguage] = useState("python");
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(16);
  const [users, setUsers] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [output, setOutput] = useState("");
  const [stdin, setStdin] = useState(""); 
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [terminalHeight, setTerminalHeight] = useState(250); 
  const [ioSplit, setIoSplit] = useState(50); 
  const resizingType = useRef(null); 
  const [activeTab, setActiveTab] = useState('problem');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameStatus, setGameStatus] = useState("waiting"); 
  const [role, setRole] = useState("Crewmate"); 
  const [gameDuration, setGameDuration] = useState(15); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [showReveal, setShowReveal] = useState(false); 
  const [meetingDuration, setMeetingDuration] = useState(60); 
  const [meetingsLeft, setMeetingsLeft] = useState(2);
  const [activeMeetingData, setActiveMeetingData] = useState(null); 
  const [kickedIds, setKickedIds] = useState([]); 
  const [isEjected, setIsEjected] = useState(false); 
  
  const [gameOverResult, setGameOverResult] = useState(null); 

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const terminalRef = useRef(null);

  // 🟢 YJS REFS (For Collab)
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  // --- RESIZING ---
  const startResizing = useCallback((type) => { resizingType.current = type; document.addEventListener("mousemove", handleResize); document.addEventListener("mouseup", stopResizing); if (type === "sidebar") document.body.style.cursor = "col-resize"; else if (type === "terminal") document.body.style.cursor = "row-resize"; else if (type === "io-split") document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }, []);
  const stopResizing = useCallback(() => { resizingType.current = null; document.removeEventListener("mousemove", handleResize); document.removeEventListener("mouseup", stopResizing); document.body.style.cursor = "default"; document.body.style.userSelect = "auto"; }, []);
  const handleResize = useCallback((e) => { if (!resizingType.current) return; if (resizingType.current === "sidebar") { const newWidth = e.clientX; if (newWidth > 250 && newWidth < 800) setSidebarWidth(newWidth); } else if (resizingType.current === "terminal") { const newHeight = window.innerHeight - e.clientY; if (newHeight > 100 && newHeight < window.innerHeight - 100) setTerminalHeight(newHeight); } else if (resizingType.current === "io-split") { if (terminalRef.current) { const rect = terminalRef.current.getBoundingClientRect(); const relativeX = e.clientX - rect.left; const newPercent = (relativeX / rect.width) * 100; if (newPercent > 10 && newPercent < 90) setIoSplit(newPercent); } } }, []);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    socket.emit("sync-users", { roomId });
    
    socket.on("question-update", (index) => {
      if (DSA_QUESTIONS[index]) setCurrentQuestion(DSA_QUESTIONS[index]);
    });

    // Note: Removed "code-update" listener here because Yjs handles text sync now.

    socket.on("language-update", (l) => setLanguage(l));
    socket.on("user-list-update", (u) => setUsers(u));
    socket.on("code-output", (res) => { setOutput(res); setIsRunning(false); });
    socket.on("user-typing", (u) => { setTypingUser(`${u} is typing...`); if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 2000); });

    socket.on("submit-result", ({ success, output }) => {
      setIsRunning(false);
      if (!success) return setOutput(`⚠️ Execution Error:\n${output}`);
      
      if (currentQuestion && currentQuestion.testCases) {
        const report = validateSubmission(output, currentQuestion.testCases);
        setOutput(report);
      } else {
        setOutput(output); 
      }
    });

    socket.on("game-started", ({ duration, impostorId, meetingsLeft, questionIndex }) => {
      setGameStatus("running");
      setTimeLeft(duration);
      setMeetingsLeft(meetingsLeft);
      if (questionIndex !== undefined && DSA_QUESTIONS[questionIndex]) {
        setCurrentQuestion(DSA_QUESTIONS[questionIndex]);
      }
      
      let myRole = "Crewmate";
      if (impostorId === null) myRole = "Collaborator";
      else if (socket.id === impostorId) myRole = "Impostor";
      setRole(myRole);
      setActiveTab("problem");
      setShowReveal(true);
      setTimeout(() => setShowReveal(false), 4000);
      setGameOverResult(null); 
    });

    socket.on("meeting-started", (data) => { setGameStatus("meeting"); setActiveMeetingData(data); setMeetingsLeft(data.meetingsLeft); setActiveTab('chat'); });
    socket.on("meeting-ended", ({ ejectedId }) => {
      setActiveMeetingData(null);
      setGameStatus("running");
      if (ejectedId) {
          setKickedIds(prev => [...prev, ejectedId]);
          if (ejectedId === socket.id) { setIsEjected(true); alert("You have been ejected! You can no longer code."); } 
          else { alert("A player was ejected."); }
      } else { alert("No one was ejected. (Tie or Skip)"); }
    });

    socket.on("timer-update", (time) => setTimeLeft(time));
    socket.on("game-over", ({ result }) => { setGameStatus("finished"); setGameOverResult(result); });

    return () => {
      socket.off("language-update"); socket.off("user-list-update"); socket.off("code-output"); socket.off("user-typing"); socket.off("submit-result"); socket.off("game-started"); socket.off("timer-update"); socket.off("game-over"); socket.off("meeting-started"); socket.off("meeting-ended"); socket.off("question-update");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, roomId, currentQuestion]);

  // OPTIMIZED HOST TIMER (No Heating)
  useEffect(() => {
    let interval = null;
    if (isHost && gameStatus === "running") {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime >= 0) socket.emit("timer-tick", { roomId, timeLeft: newTime });
          return newTime;
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isHost, gameStatus, roomId, socket]);

  // 🟢 MONACO + YJS SETUP (REAL-TIME COLLABORATION)
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // 1. Initialize Yjs Doc
    const doc = new Y.Doc();
    ydocRef.current = doc;

    // 2. Connect to Y-Socket.io
    // Detect URL automatically like App.js
    const SOCKET_URL = process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:3001';
    
    const provider = new SocketIOProvider(
      SOCKET_URL, 
      roomId, // Use room ID as namespace
      doc, 
      { autoConnect: true }
    );
    providerRef.current = provider;

    // 3. Define Shared Text Type
    const type = doc.getText("monaco");

    // 4. Bind Yjs to Monaco Editor
    const binding = new MonacoBinding(
      type,
      editor.getModel(),
      new Set([editor]),
      provider.awareness // Enables Multiple Cursors
    );
    bindingRef.current = binding;

    // 5. Set User Awareness (Cursor Color & Name)
    const userColor = getUserColor(username);
    provider.awareness.setLocalStateField("user", {
      name: username,
      color: userColor,
    });
  };

  // Cleanup Yjs on unmount
  useEffect(() => {
    return () => {
      if (bindingRef.current) bindingRef.current.destroy();
      if (providerRef.current) providerRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, [roomId]);

  // --- ACTIONS ---
  const handleStartGame = () => { socket.emit("start-game", { roomId, duration: gameDuration, meetingDuration: meetingDuration }); };
  const handleCallEmergency = () => { if (meetingsLeft > 0) socket.emit("call-emergency", { roomId }); };
  const handleVote = (targetId) => { socket.emit("cast-vote", { roomId, targetId }); };
  
  // Note: handleEditorChange removed because Yjs handles typing now.

  const runCode = () => { 
    if(isEjected) return alert("You are dead."); 
    setIsRunning(true); setOutput("Running..."); 
    // Get code directly from editor instance now
    const currentCode = editorRef.current.getValue();
    socket.emit("run-code", { roomId, language, code: currentCode, stdin }); 
  };

  const validateSubmission = (rawOutput, testCases) => {
    const userOutputs = rawOutput.trim().split('\n').map(l => l.trim()).filter(l => l !== "");
    let log = `📊 SUBMISSION RESULTS\n=============================\n`;
    let passedCount = 0;
    testCases.forEach((tc, index) => {
      const expected = normalizeExpected(tc.output);
      const actual = userOutputs[index] ? normalizeOutput(userOutputs[index]) : "No Output";
      const isCorrect = expected === actual;
      if (isCorrect) passedCount++;
      log += `Test Case ${index + 1}: ${isCorrect ? "✅ PASS" : "❌ FAIL"}\n`;
      if (!isCorrect) log += `   Expected: ${expected}\n   Actual:   ${actual}\n`;
    });
    log += `=============================\nScore: ${passedCount} / ${testCases.length} Passed\n`;
    
    if (passedCount === testCases.length) {
      log += `\n🎉 MISSION ACCOMPLISHED!`;
      socket.emit("mission-complete", { roomId });
    }
    return log;
  };

  const submitCode = () => {
    if(isEjected) return alert("You are dead.");
    if (!currentQuestion) return alert("No question selected!");
    setIsRunning(true);
    setOutput("🚀 Submitting code to mainframe...");
    const t = currentQuestion.testCases.length;
    const inputs = currentQuestion.testCases.map(tc => formatInputForExecution(tc.input));
    const batchInput = `${t}\n${inputs.join('\n')}`;
    // Get code from instance
    const currentCode = editorRef.current.getValue();
    socket.emit("submit-code", { roomId, language, code: currentCode, stdin: batchInput });
  };

  const handleLanguageChange = (e) => { 
    setLanguage(e.target.value); 
    socket.emit("language-change", { roomId, language: e.target.value }); 
  };
  
  const leaveRoom = () => { socket.emit("leave-room", { roomId }); onLeave(); };
  const getUserColor = (username) => { const colors = ["#FF0000", "#00FF00", "#0088FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500"]; let hash = 0; for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash); return colors[Math.abs(hash) % colors.length]; };
  const formatTime = (seconds) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs < 10 ? "0" : ""}${secs}`; };
  const getRoleColor = () => { if (role === "Impostor") return "var(--neon-red)"; if (role === "Crewmate") return "var(--neon-cyan)"; return "var(--neon-green)"; };

  // Reset safely via Yjs Transaction
  const handleReset = () => {
     if(editorRef.current && BOILERPLATES[language]) {
        const doc = ydocRef.current;
        const text = doc.getText("monaco");
        doc.transact(() => {
            text.delete(0, text.length);
            text.insert(0, BOILERPLATES[language]);
        });
     }
  };

  const renderGameOverOverlay = () => {
    if (!gameOverResult) return null;
    let title = "", subtext = "", color = "";

    if (gameOverResult === "CREWMATE_WIN") {
      title = "VICTORY"; subtext = "Code Submitted. System Restored."; color = "var(--neon-cyan)";
    } else if (gameOverResult === "IMPOSTOR_WIN") {
      title = "DEFEAT"; subtext = "Time Limit Exceeded. Impostor Sabotaged the Mission."; color = "var(--neon-red)";
    } else {
      title = "STALEMATE"; subtext = "Time Limit Exceeded, but Impostor was Neutralized."; color = "var(--neon-yellow)";
    }

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 20000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', animation: 'fadeIn 1s' }}>
        <h1 style={{ fontSize: '5rem', color: color, textShadow: `0 0 40px ${color}`, margin: 0, fontFamily: 'Orbitron' }}>{title}</h1>
        <p style={{ color: '#fff', fontSize: '1.2rem', marginTop: '20px', fontFamily: 'Orbitron' }}>{subtext}</p>
        <button onClick={() => { setGameOverResult(null); setGameStatus("waiting"); }} style={{ marginTop: '40px', padding: '15px 40px', fontSize: '1.2rem', background: 'transparent', border: `2px solid ${color}`, color: color, cursor: 'pointer', fontFamily: 'Orbitron', fontWeight: 'bold' }}>RETURN TO LOBBY</button>
      </div>
    );
  };

  return (
    <div className={`editor-wrapper ${theme}`} style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
      
      {renderGameOverOverlay()}
      {showReveal && <RoleReveal role={role} />}
      {gameStatus === "meeting" && activeMeetingData && (
          <EmergencyMeeting 
            users={users}
            caller={activeMeetingData.caller}
            timeLeft={activeMeetingData.timeLeft}
            onVote={handleVote}
            kickedIds={kickedIds}
            currentUserId={socket.id}
          />
      )}

      <div className="sidebar" style={{ width: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#0b0d14', borderRight: '1px solid #333' }}>
        <div className="sidebar-header" style={{ flexShrink: 0, padding: '15px', borderBottom: '1px solid #333' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
               <img src="/logo.png" alt="Logo" style={{ height: "24px" }} />
               <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{roomId}</h3>
            </div>
            {gameStatus === "running" && (<span className="timer-badge">⏳ {formatTime(timeLeft)}</span>)}
          </div>
          {gameStatus === "running" && (<div className="role-badge" style={{ borderColor: getRoleColor(), color: getRoleColor() }}>ROLE: {role}</div>)}
          <div className="status-badges" style={{marginTop: '10px'}}><span className="user-count-badge">🟢 {users.length} / 6 Online</span></div>
        </div>

        <div className="sidebar-tabs" style={{ display: 'flex', borderBottom: '1px solid #333' }}>
          <button className={`tab-btn ${activeTab === 'problem' ? 'active' : ''}`} onClick={() => setActiveTab('problem')}>📋 Problem</button>
          <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Chat</button>
        </div>

        <div className="sidebar-content" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'problem' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
               {gameStatus === "waiting" && isHost ? (
                 <div className="host-panel">
                   <h4 style={{ color: "var(--neon-yellow)", margin: "0 0 10px 0", textAlign:"center" }}>⚡ MISSION CONTROL</h4>
                   <label style={{ color: "#ccc", fontSize: "0.8rem", display:"block", marginBottom:"5px" }}>Game Time: <span style={{color: "var(--neon-cyan)"}}>{gameDuration} Mins</span></label>
                   <input type="range" min="1" max="60" value={gameDuration} onChange={(e) => setGameDuration(e.target.value)} style={{ width: "100%", margin: "0 0 15px 0", cursor: "pointer" }} />
                   <label style={{ color: "#ccc", fontSize: "0.8rem", display:"block", marginBottom:"5px" }}>Meeting Time: <span style={{color: "var(--neon-red)"}}>{meetingDuration} Secs</span></label>
                   <input type="range" min="20" max="120" step="20" value={meetingDuration} onChange={(e) => setMeetingDuration(e.target.value)} style={{ width: "100%", margin: "0 0 15px 0", cursor: "pointer" }} />
                   <div style={{fontSize: "0.75rem", color: "#888", marginBottom: "15px", textAlign:"center"}}>{users.length < 3 ? "⚠ Everyone is Collaborator" : "✅ Impostor Mode Active"}</div>
                   <button className="start-game-btn" onClick={handleStartGame}>START GAME</button>
                 </div>
               ) : gameStatus === "waiting" ? (
                 <div style={{ textAlign: "center", padding: "40px 20px", color: "#666", border: "1px dashed #333", borderRadius: "8px", margin: "10px" }}><h3>WAITING FOR HOST</h3><p>The mission will begin shortly...</p></div>
               ) : (
                 <QuestionPanel question={currentQuestion} />
               )}
               {gameStatus === "running" && !isEjected && (
                   <div style={{marginTop: '20px', textAlign: 'center'}}>
                       <button className={`emergency-btn ${meetingsLeft <= 0 ? 'disabled' : ''}`} onClick={handleCallEmergency} disabled={meetingsLeft <= 0} style={{width: '100%', padding: '12px', background: 'var(--neon-red)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: meetingsLeft > 0 ? 'pointer' : 'not-allowed', opacity: meetingsLeft > 0 ? 1 : 0.5}}>🚨 CALL MEETING ({meetingsLeft})</button>
                   </div>
               )}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="users-list-compact" style={{ maxHeight: '120px', overflowY: 'auto', borderBottom: '1px solid #333', padding: '10px' }}>
                <h4 style={{margin: '0 0 5px 0', fontSize: '0.8rem', color:'#666'}}>USERS</h4>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>{users.map((u) => (<li key={u.id} style={{ color: getUserColor(u.username), fontSize: '0.9rem', padding: '2px 0', opacity: kickedIds.includes(u.id) ? 0.5 : 1, textDecoration: kickedIds.includes(u.id) ? 'line-through' : 'none' }}>● {u.username} {kickedIds.includes(u.id) ? "(EJECTED)" : ""}</li>))}</ul>
              </div>
              <VoiceChat roomId={roomId} username={username} />
              <Chat socket={socket} roomId={roomId} username={username} />
            </div>
          )}
        </div>
        <div className="sidebar-footer" style={{ flexShrink: 0, padding: '15px', borderTop: '1px solid #333' }}>
          <div className="footer-buttons" style={{ display: "flex", gap: "10px" }}>
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(editorRef.current.getValue())} style={{ flex: 1 }}>Copy</button>
            <button className="reset-btn" onClick={handleReset} style={{ flex: 1 }}>Reset</button>
          </div>
          <div className="exit-buttons" style={{marginTop: '10px'}}>
            {isHost ? (<button className="end-btn" style={{width:'100%'}} onClick={() => { if (window.confirm("End meeting?")) { socket.emit("end-room", { roomId }); onLeave(); }}}>End Meeting</button>) : (<button className="leave-btn" style={{width:'100%'}} onClick={leaveRoom}>Leave Room</button>)}
          </div>
        </div>
      </div>

      <div className="resizer-v" onMouseDown={() => startResizing("sidebar")} style={{ width: '5px', background: '#111', cursor: 'col-resize', zIndex: 10, borderLeft:'1px solid #333', borderRight:'1px solid #000' }} />

      <div className="main-editor" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="toolbar" style={{ flexShrink: 0 }}>
          <div className="toolbar-group">
            <select value={language} onChange={handleLanguageChange}><option value="python">Python</option><option value="java">Java</option><option value="cpp">C++</option><option value="c">C</option></select>
            <button className="run-btn" onClick={runCode} disabled={isRunning}>{isRunning ? "Running..." : "▶ Run Code"}</button>
            <button className="submit-btn" onClick={submitCode} disabled={isRunning} style={{ marginLeft: '10px' }}>{isRunning ? "..." : "✓ Submit"}</button>
          </div>
          <div className="toolbar-group"><label style={{ fontSize: "12px" }}>Size: {fontSize}px</label><input type="range" min="12" max="24" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} /></div>
          <div className="toolbar-group"><button className="theme-toggle" onClick={() => setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"))}>{theme === "vs-dark" ? "☀️ Light" : "🌙 Dark"}</button></div>
          <span className="typing-indicator">{typingUser}</span>
        </div>

        <div className="editor-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {isEjected && (<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--neon-red)', fontFamily: 'Orbitron' }}><h1 style={{fontSize: '3rem', margin: 0, textShadow: '0 0 20px red'}}>👻 YOU ARE DEAD</h1><p>SYSTEM OFFLINE. You can chat, but cannot code.</p></div>)}
          <div style={{ flex: 1, minHeight: 0 }}>
             {/* 🟢 REMOVE 'value' and 'onChange' props because Yjs handles it now */}
             <Editor 
                height="100%" 
                theme={theme} 
                language={language} 
                onMount={handleEditorDidMount} 
                options={{ minimap: { enabled: false }, fontSize: fontSize, wordWrap: "on", automaticLayout: true, readOnly: isEjected }} 
              />
          </div>
          <div className="resizer-h" onMouseDown={() => startResizing("terminal")} style={{ height: '5px', background: '#111', cursor: 'row-resize', borderTop: '1px solid #333', zIndex: 10 }} />
          <div ref={terminalRef} className="terminal-panel" style={{ height: `${terminalHeight}px`, flexShrink: 0, display: 'flex', flexDirection: 'row', background: '#0e1016', overflow: 'hidden' }}>
            <div style={{ width: `${ioSplit}%`, display: 'flex', flexDirection: 'column', borderRight: '1px solid #333' }}>
              <div style={{ padding: '5px 10px', background: '#1e1e1e', color: '#aaa', fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #333' }}>INPUT</div>
              <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} placeholder="Enter input here..." disabled={isEjected} style={{ flex: 1, width: '100%', resize: 'none', background: 'transparent', color: '#fff', border: 'none', padding: '10px', fontFamily: 'monospace', outline: 'none' }} />
            </div>
            <div onMouseDown={() => startResizing("io-split")} style={{ width: '5px', background: '#222', cursor: 'col-resize', borderLeft: '1px solid #111', borderRight: '1px solid #111', zIndex: 5 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
               <div style={{ padding: '5px 10px', background: '#1e1e1e', color: '#aaa', fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #333' }}>OUTPUT</div>
               <pre style={{ flex: 1, margin: 0, padding: '10px', overflow: 'auto', fontFamily: 'monospace', color: '#ccc', whiteSpace: 'pre-wrap' }}>{output || "Run code to see output..."}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;