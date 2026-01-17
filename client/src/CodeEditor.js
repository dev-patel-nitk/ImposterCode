// FILE: client/src/CodeEditor.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import debounce from "lodash/debounce";
import Chat from "./Chat";
import VoiceChat from "./VoiceChat";
import { DSA_QUESTIONS } from "./dsaQuestions"; 
import QuestionPanel from "./QuestionPanel";

// --- NEW IMPORTS: Helper functions for validation ---
import { formatInputForExecution, normalizeOutput, normalizeExpected } from "./testUtils"; 

// FILE: client/src/CodeEditor.js

// FILE: client/src/CodeEditor.js

const BOILERPLATES = {
  // PYTHON: Reads T, then loops T times calling solve()
  python: `import sys\n\ndef solve():\n    # inputs\n    # *your solution*\n    pass\n\nif __name__ == "__main__":\n    try:\n        # Read all input to handle newlines strictly like cin >>\n        input_data = sys.stdin.read().split()\n        if input_data:\n            iterator = iter(input_data)\n            tc = int(next(iterator))\n            for _ in range(tc):\n                solve()\n    except Exception:\n        pass`,

  // JAVA: Reads T, then loops T times calling solve()
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void solve(Scanner sc) {\n        // inputs\n        // *your solution*\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int tc = sc.nextInt();\n            while (tc-- > 0) {\n                solve(sc);\n            }\n        }\n    }\n}`,

  // CPP: Your requested format
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve(){\n    //inputs\n    //*your solution*\n}\n\nint main() {\n    int tc;\n    if (cin >> tc) {\n        while(tc--) solve();\n    }\n    return 0;\n}`,

  // C: Reads T, then loops T times calling solve()
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

  // --- TERMINAL STATE (Input/Output) ---
  const [output, setOutput] = useState("");
  const [stdin, setStdin] = useState(""); 

  // --- LAYOUT & RESIZING STATE ---
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [terminalHeight, setTerminalHeight] = useState(250); 
  const [ioSplit, setIoSplit] = useState(50); 
  
  const resizingType = useRef(null); 

  // --- SIDEBAR TAB STATE ---
  const [activeTab, setActiveTab] = useState('problem');
  const [currentQuestion, setCurrentQuestion] = useState(null);

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

  // --- RESIZING LOGIC (Preserved) ---
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
      if (newHeight > 100 && newHeight < window.innerHeight - 100) {
        setTerminalHeight(newHeight);
      }
    }
    else if (resizingType.current === "io-split") {
       if (terminalRef.current) {
         const rect = terminalRef.current.getBoundingClientRect();
         const relativeX = e.clientX - rect.left;
         const newPercent = (relativeX / rect.width) * 100;
         if (newPercent > 10 && newPercent < 90) {
           setIoSplit(newPercent);
         }
       }
    }
  }, []);

  // --- SOCKETS ---
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

    // --- NEW: Handle Submit Result ---
    socket.on("submit-result", ({ success, output, memory, cpuTime }) => {
      setIsRunning(false);
      
      if (!success) {
        setOutput(`⚠️ Execution Error:\n${output}`);
        return;
      }
      // If we have a current question, validate the results client-side
      if (currentQuestion && currentQuestion.testCases) {
        const report = validateSubmission(output, currentQuestion.testCases);
        setOutput(report);
      } else {
        setOutput(output); 
      }
    });

    return () => {
      socket.off("code-update");
      socket.off("language-update");
      socket.off("user-list-update");
      socket.off("code-output");
      socket.off("user-typing");
      // NEW: Cleanup submit listener
      socket.off("submit-result");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, roomId, currentQuestion]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };
  const handleEditorChange = (value) => {
    setCode(value);
    debouncedEmit(value);
    socket.emit("typing", { roomId, username });
  };
  
  // Existing Run Code Logic
  const runCode = () => {
    setIsRunning(true);
    setOutput("Running...");
    socket.emit("run-code", { roomId, language, code, stdin });
  };

  // --- NEW: Submit Logic ---
  const validateSubmission = (rawOutput, testCases) => {
    const userOutputs = rawOutput.trim().split('\n').map(l => l.trim()).filter(l => l !== "");
    let log = `📊 SUBMISSION RESULTS\n`;
    log += `=============================\n`;
    let passedCount = 0;

    testCases.forEach((tc, index) => {
      const expected = normalizeExpected(tc.output);
      const actual = userOutputs[index] ? normalizeOutput(userOutputs[index]) : "No Output";
      const isCorrect = expected === actual;
      if (isCorrect) passedCount++;
      const statusIcon = isCorrect ? "✅ PASS" : "❌ FAIL";
      log += `Test Case ${index + 1}: ${statusIcon}\n`;
      if (!isCorrect) {
        log += `   Expected: ${expected}\n`;
        log += `   Actual:   ${actual}\n`;
      }
    });
    log += `=============================\n`;
    log += `Score: ${passedCount} / ${testCases.length} Passed\n`;
    if (passedCount === testCases.length) {
      log += `\n🎉 MISSION ACCOMPLISHED! ALL TESTS PASSED!`;
    }
    return log;
  };

  const submitCode = () => {
    if (!currentQuestion) {
      alert("No question selected to submit against!");
      return;
    }
    setIsRunning(true);
    setOutput("🚀 Submitting code to mainframe...");

    // 1. Construct Batch Input: T + Input1 + Input2 ...
    const t = currentQuestion.testCases.length;
    const inputs = currentQuestion.testCases.map(tc => formatInputForExecution(tc.input));
    const batchInput = `${t}\n${inputs.join('\n')}`;

    // 2. Emit to Server
    socket.emit("submit-code", { 
      roomId, 
      language, 
      code, 
      stdin: batchInput 
    });
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

  return (
    <div className={`editor-wrapper ${theme}`} style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
      
      {/* --- SIDEBAR --- */}
      <div className="sidebar" style={{ width: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#0b0d14', borderRight: '1px solid #333' }}>
        
        {/* Header */}
        <div className="sidebar-header" style={{ flexShrink: 0, padding: '15px', borderBottom: '1px solid #333' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="Logo" style={{ height: "30px" }} />
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Room: {roomId}</h3>
          </div>
          <div className="status-badges" style={{marginTop: '10px'}}>
             <span className="user-count-badge">🟢 {users.length} Online</span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <div className="sidebar-tabs" style={{ display: 'flex', borderBottom: '1px solid #333' }}>
          <button className={`tab-btn ${activeTab === 'problem' ? 'active' : ''}`} onClick={() => setActiveTab('problem')} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'problem' ? '2px solid cyan' : 'none' }}>📋 Problem</button>
          <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'chat' ? '2px solid cyan' : 'none' }}>💬 Chat</button>
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'problem' ? (
            <div style={{ flex: 1, overflowY: 'auto' }}>
               <QuestionPanel question={currentQuestion} onNext={handleNextQuestion} />
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
            
            {/* --- NEW: SUBMIT BUTTON ADDED HERE --- */}
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
          
          {/* Monaco Editor (Top) */}
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

          {/* Terminal Height Resizer */}
          <div className="resizer-h" onMouseDown={() => startResizing("terminal")} style={{ height: '5px', background: '#111', cursor: 'row-resize', borderTop: '1px solid #333', zIndex: 10 }} />

          {/* --- TERMINAL PANEL (SPLIT INPUT/OUTPUT) --- */}
          <div 
             ref={terminalRef}
             className="terminal-panel" 
             style={{ 
               height: `${terminalHeight}px`, 
               flexShrink: 0, 
               display: 'flex', 
               flexDirection: 'row', // Horizontal Layout
               background: '#0e1016',
               overflow: 'hidden'
             }}
          >
            
            {/* 1. INPUT SECTION (Left) */}
            <div style={{ width: `${ioSplit}%`, display: 'flex', flexDirection: 'column', borderRight: '1px solid #333' }}>
              <div style={{ padding: '5px 10px', background: '#1e1e1e', color: '#aaa', fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
                INPUT
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter input here..."
                style={{
                  flex: 1, width: '100%', resize: 'none', background: 'transparent',
                  color: '#fff', border: 'none', padding: '10px', fontFamily: 'monospace', outline: 'none'
                }}
              />
            </div>

            {/* 2. SPLIT RESIZER (Middle) */}
            <div 
              onMouseDown={() => startResizing("io-split")}
              style={{
                width: '5px', background: '#222', cursor: 'col-resize',
                borderLeft: '1px solid #111', borderRight: '1px solid #111',
                zIndex: 5
              }}
            />

            {/* 3. OUTPUT SECTION (Right) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
               <div style={{ padding: '5px 10px', background: '#1e1e1e', color: '#aaa', fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
                OUTPUT
              </div>
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