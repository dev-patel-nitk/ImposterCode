// FILE: client/src/CodeEditor.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import debounce from "lodash/debounce";
import Chat from "./Chat";
import VoiceChat from "./VoiceChat";
import { DSA_QUESTIONS } from "./dsaQuestions"; 
import QuestionPanel from "./QuestionPanel";
import { formatInputForExecution, normalizeOutput, normalizeExpected } from "./testUtils"; 

const BOILERPLATES = {
  python: `import sys\n\ndef solve():\n    # inputs\n    # *your solution*\n    pass\n\nif __name__ == "__main__":\n    try:\n        # Read all input to handle newlines strictly like cin >>\n        input_data = sys.stdin.read().split()\n        if input_data:\n            iterator = iter(input_data)\n            tc = int(next(iterator))\n            for _ in range(tc):\n                solve()\n    except Exception:\n        pass`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void solve(Scanner sc) {\n        // inputs\n        // *your solution*\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int tc = sc.nextInt();\n            while (tc-- > 0) {\n                solve(sc);\n            }\n        }\n    }\n}`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve(){\n    //inputs\n    //*your solution*\n}\n\nint main() {\n    int tc;\n    if (cin >> tc) {\n        while(tc--) solve();\n    }\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nvoid solve() {\n    // inputs\n    // *your solution*\n}\n\nint main() {\n    int tc;\n    if (scanf("%d", &tc) == 1) {\n        while (tc--) {\n            solve();\n        }\n    }\n    return 0;\n}`,
};

const CodeEditor = ({ socket, roomId, username, isHost, onLeave }) => {
  // --- CORE STATE ---
  const [code, setCode] = useState("// Loading...");
  const [language, setLanguage] = useState("python");
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(16);
  const [users, setUsers] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  // --- TERMINAL STATE ---
  const [output, setOutput] = useState("");
  const [stdin, setStdin] = useState(""); 

  // --- LAYOUT STATE ---
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [terminalHeight, setTerminalHeight] = useState(250); 
  const [ioSplit, setIoSplit] = useState(50); 
  const resizingType = useRef(null); 

  // --- GAME & QUESTION STATE ---
  const [activeTab, setActiveTab] = useState('problem');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // 🟢 NEW: GAME LOGIC STATES
  const [gameStatus, setGameStatus] = useState("waiting"); // 'waiting', 'running', 'finished'
  const [role, setRole] = useState("Crewmate"); // 'Crewmate', 'Impostor', 'Collaborator'
  const [gameDuration, setGameDuration] = useState(15); // Default 15 mins
  const [timeLeft, setTimeLeft] = useState(0);

  // Refs
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const terminalRef = useRef(null);

  const debouncedEmit = useCallback(
    debounce((newCode) => {
      socket.emit("code-change", { roomId, code: newCode });
    }, 300),
    [roomId, socket]
  );

  useEffect(() => {
    const randomQ = DSA_QUESTIONS[Math.floor(Math.random() * DSA_QUESTIONS.length)];
    setCurrentQuestion(randomQ);
  }, []);

  const handleNextQuestion = () => {
    const randomQ = DSA_QUESTIONS[Math.floor(Math.random() * DSA_QUESTIONS.length)];
    setCurrentQuestion(randomQ);
  };

  // --- RESIZING LOGIC ---
  const startResizing = useCallback((type) => {
    resizingType.current = type;
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResizing);
    
    if (type === "sidebar") document.body.style.cursor = "col-resize";
    else if (type === "terminal") document.body.style.cursor = "row-resize";
    else if (type === "io-split") document.body.style.cursor = "col-resize";
    
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    resizingType.current = null;
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  const handleResize = useCallback((e) => {
    if (!resizingType.current) return;
    if (resizingType.current === "sidebar") {
      const newWidth = e.clientX;
      if (newWidth > 250 && newWidth < 800) setSidebarWidth(newWidth);
    } 
    else if (resizingType.current === "terminal") {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 100 && newHeight < window.innerHeight - 100) setTerminalHeight(newHeight);
    }
    else if (resizingType.current === "io-split") {
       if (terminalRef.current) {
         const rect = terminalRef.current.getBoundingClientRect();
         const relativeX = e.clientX - rect.left;
         const newPercent = (relativeX / rect.width) * 100;
         if (newPercent > 10 && newPercent < 90) setIoSplit(newPercent);
       }
    }
  }, []);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    socket.emit("sync-users", { roomId });
    socket.on("code-update", (newCode) => {
      if (editorRef.current && editorRef.current.getValue() !== newCode) {
        const pos = editorRef.current.getPosition();
        setCode(newCode);
        if (pos) editorRef.current.setPosition(pos);
      }
    });
    socket.on("language-update", (newLang) => setLanguage(newLang));
    socket.on("user-list-update", (userList) => setUsers(userList));
    socket.on("code-output", (result) => {
      setOutput(result);
      setIsRunning(false);
    });
    socket.on("user-typing", (user) => {
      setTypingUser(`${user} is typing...`);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 2000);
    });

    socket.on("submit-result", ({ success, output, memory, cpuTime }) => {
      setIsRunning(false);
      if (!success) {
        setOutput(`⚠️ Execution Error:\n${output}`);
        return;
      }
      if (currentQuestion && currentQuestion.testCases) {
        const report = validateSubmission(output, currentQuestion.testCases);
        setOutput(report);
      } else {
        setOutput(output); 
      }
    });

    // 🟢 NEW: GAME LOGIC LISTENERS
    socket.on("game-started", ({ duration, impostorId }) => {
      setGameStatus("running");
      setTimeLeft(duration);
      // Determine Role
      if (impostorId === null) {
        setRole("Collaborator");
      } else {
        setRole(socket.id === impostorId ? "Impostor" : "Crewmate");
      }
      // Force tab to problem when game starts
      setActiveTab("problem");
    });

    socket.on("timer-update", (time) => setTimeLeft(time));
    
    socket.on("game-over", () => {
      setGameStatus("finished");
      alert("TIME UP! Mission Ended.");
    });

    return () => {
      socket.off("code-update");
      socket.off("language-update");
      socket.off("user-list-update");
      socket.off("code-output");
      socket.off("user-typing");
      socket.off("submit-result");
      // Cleanup Game Listeners
      socket.off("game-started");
      socket.off("timer-update");
      socket.off("game-over");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, roomId, currentQuestion]);

  // 🟢 NEW: HOST TIMER LOGIC
  useEffect(() => {
    let interval = null;
    // Host drives the clock
    if (isHost && gameStatus === "running" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          socket.emit("timer-tick", { roomId, timeLeft: newTime });
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isHost, gameStatus, timeLeft, roomId, socket]);

  // --- HELPERS ---
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };
  const handleEditorChange = (value) => {
    setCode(value);
    debouncedEmit(value);
    socket.emit("typing", { roomId, username });
  };
  
  const runCode = () => {
    setIsRunning(true);
    setOutput("Running...");
    socket.emit("run-code", { roomId, language, code, stdin });
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
    if (passedCount === testCases.length) log += `\n🎉 MISSION ACCOMPLISHED! ALL TESTS PASSED!`;
    return log;
  };

  const submitCode = () => {
    if (!currentQuestion) return alert("No question selected!");
    setIsRunning(true);
    setOutput("🚀 Submitting code to mainframe...");
    const t = currentQuestion.testCases.length;
    const inputs = currentQuestion.testCases.map(tc => formatInputForExecution(tc.input));
    const batchInput = `${t}\n${inputs.join('\n')}`;
    socket.emit("submit-code", { roomId, language, code, stdin: batchInput });
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    socket.emit("language-change", { roomId, language: e.target.value });
  };
  const leaveRoom = () => {
    socket.emit("leave-room", { roomId });
    onLeave();
  };
  const getUserColor = (username) => {
    const colors = ["#FF0000", "#00FF00", "#0088FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500"];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // 🟢 NEW: Helpers for Game UI
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleStartGame = () => {
    socket.emit("start-game", { roomId, duration: gameDuration });
  };

  const getRoleColor = () => {
    if (role === "Impostor") return "var(--neon-red)";
    if (role === "Crewmate") return "var(--neon-cyan)";
    return "var(--neon-green)"; // Collaborator
  };

  return (
    <div className={`editor-wrapper ${theme}`} style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
      
      {/* --- SIDEBAR --- */}
      <div className="sidebar" style={{ width: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#0b0d14', borderRight: '1px solid #333' }}>
        
        {/* Header */}
        <div className="sidebar-header" style={{ flexShrink: 0, padding: '15px', borderBottom: '1px solid #333' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
               <img src="/logo.png" alt="Logo" style={{ height: "24px" }} />
               <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{roomId}</h3>
            </div>
            {/* 🟢 Timer Display */}
            {gameStatus === "running" && (
                <span className="timer-badge">
                  ⏳ {formatTime(timeLeft)}
                </span>
            )}
          </div>

          {/* 🟢 Role Display */}
          {gameStatus === "running" && (
            <div className="role-badge" style={{ borderColor: getRoleColor(), color: getRoleColor() }}>
              ROLE: {role}
            </div>
          )}

          <div className="status-badges" style={{marginTop: '10px'}}>
             <span className="user-count-badge">🟢 {users.length} / 6 Online</span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <div className="sidebar-tabs" style={{ display: 'flex', borderBottom: '1px solid #333' }}>
          <button className={`tab-btn ${activeTab === 'problem' ? 'active' : ''}`} onClick={() => setActiveTab('problem')}>📋 Problem</button>
          <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>💬 Chat</button>
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'problem' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
               
               {/* 🟢 HOST CONTROL PANEL */}
               {gameStatus === "waiting" && isHost ? (
                 <div className="host-panel">
                   <h4 style={{ color: "var(--neon-yellow)", margin: "0 0 10px 0", textAlign:"center" }}>⚡ MISSION CONTROL</h4>
                   
                   <label style={{ color: "#ccc", fontSize: "0.8rem", display:"block", marginBottom:"5px" }}>
                     Timer: <span style={{color: "var(--neon-cyan)"}}>{gameDuration} Mins</span>
                   </label>
                   <input 
                     type="range" 
                     min="1" max="60" 
                     value={gameDuration} 
                     onChange={(e) => setGameDuration(e.target.value)}
                     style={{ width: "100%", margin: "0 0 15px 0", cursor: "pointer" }} 
                   />
                   
                   <div style={{fontSize: "0.75rem", color: "#888", marginBottom: "15px", textAlign:"center"}}>
                     {users.length < 3 
                        ? "⚠ < 3 Players: Everyone is Collaborator" 
                        : "✅ 3+ Players: Impostor Mode Active"
                     }
                   </div>

                   <button className="start-game-btn" onClick={handleStartGame}>
                     START GAME
                   </button>
                 </div>
               ) : gameStatus === "waiting" ? (
                 <div style={{ textAlign: "center", padding: "40px 20px", color: "#666", border: "1px dashed #333", borderRadius: "8px", margin: "10px" }}>
                   <h3>WAITING FOR HOST</h3>
                   <p>The mission will begin shortly...</p>
                 </div>
               ) : (
                 // Show Question Panel when game is running
                 <QuestionPanel question={currentQuestion} onNext={handleNextQuestion} />
               )}

            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="users-list-compact" style={{ maxHeight: '120px', overflowY: 'auto', borderBottom: '1px solid #333', padding: '10px' }}>
                <h4 style={{margin: '0 0 5px 0', fontSize: '0.8rem', color:'#666'}}>USERS</h4>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {users.map((u) => (<li key={u.id} style={{ color: getUserColor(u.username), fontSize: '0.9rem', padding: '2px 0' }}>● {u.username}</li>))}
                </ul>
              </div>
              <VoiceChat roomId={roomId} username={username} />
              <Chat socket={socket} roomId={roomId} username={username} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer" style={{ flexShrink: 0, padding: '15px', borderTop: '1px solid #333' }}>
          <div className="footer-buttons" style={{ display: "flex", gap: "10px" }}>
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(code)} style={{ flex: 1 }}>Copy</button>
            <button className="reset-btn" onClick={() => {setCode(BOILERPLATES[language] || ""); socket.emit("code-change", { roomId, code: BOILERPLATES[language] || "" });}} style={{ flex: 1 }}>Reset</button>
          </div>
          <div className="exit-buttons" style={{marginTop: '10px'}}>
            {isHost ? (
              <button className="end-btn" style={{width:'100%'}} onClick={() => { if (window.confirm("End meeting?")) { socket.emit("end-room", { roomId }); onLeave(); }}}>End Meeting</button>
            ) : (
              <button className="leave-btn" style={{width:'100%'}} onClick={leaveRoom}>Leave Room</button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Resizer */}
      <div className="resizer-v" onMouseDown={() => startResizing("sidebar")} style={{ width: '5px', background: '#111', cursor: 'col-resize', zIndex: 10, borderLeft:'1px solid #333', borderRight:'1px solid #000' }} />

      {/* --- MAIN EDITOR AREA --- */}
      <div className="main-editor" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Toolbar */}
        <div className="toolbar" style={{ flexShrink: 0 }}>
          <div className="toolbar-group">
            <select value={language} onChange={handleLanguageChange}>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
            <button className="run-btn" onClick={runCode} disabled={isRunning}>{isRunning ? "Running..." : "▶ Run Code"}</button>
            <button className="submit-btn" onClick={submitCode} disabled={isRunning} style={{ marginLeft: '10px' }}>
              {isRunning ? "..." : "✓ Submit"}
            </button>
          </div>
          <div className="toolbar-group">
            <label style={{ fontSize: "12px" }}>Size: {fontSize}px</label>
            <input type="range" min="12" max="24" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} />
          </div>
          <div className="toolbar-group">
            <button className="theme-toggle" onClick={() => setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"))}>
              {theme === "vs-dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
          <span className="typing-indicator">{typingUser}</span>
        </div>

        {/* Editor & Terminal Container */}
        <div className="editor-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div style={{ flex: 1, minHeight: 0 }}>
             <Editor
              height="100%"
              theme={theme}
              language={language}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{ minimap: { enabled: false }, fontSize: fontSize, wordWrap: "on", automaticLayout: true }}
            />
          </div>

          <div className="resizer-h" onMouseDown={() => startResizing("terminal")} style={{ height: '5px', background: '#111', cursor: 'row-resize', borderTop: '1px solid #333', zIndex: 10 }} />

          <div ref={terminalRef} className="terminal-panel" style={{ height: `${terminalHeight}px`, flexShrink: 0, display: 'flex', flexDirection: 'row', background: '#0e1016', overflow: 'hidden' }}>
            <div style={{ width: `${ioSplit}%`, display: 'flex', flexDirection: 'column', borderRight: '1px solid #333' }}>
              <div style={{ padding: '5px 10px', background: '#1e1e1e', color: '#aaa', fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #333' }}>INPUT</div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input here..."
                style={{ flex: 1, width: '100%', resize: 'none', background: 'transparent', color: '#fff', border: 'none', padding: '10px', fontFamily: 'monospace', outline: 'none' }}
              />
            </div>
            <div onMouseDown={() => startResizing("io-split")} style={{ width: '5px', background: '#222', cursor: 'col-resize', borderLeft: '1px solid #111', borderRight: '1px solid #111', zIndex: 5 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
               <div style={{ padding: '5px 10px', background: '#1e1e1e', color: '#aaa', fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #333' }}>OUTPUT</div>
               <pre style={{ flex: 1, margin: 0, padding: '10px', overflow: 'auto', fontFamily: 'monospace', color: '#ccc', whiteSpace: 'pre-wrap' }}>
                {output || "Run code to see output..."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;