// FILE: client/src/CodeEditor.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import debounce from "lodash/debounce";
import Chat from "./Chat";
import VoiceChat from "./VoiceChat";

const BOILERPLATES = {
  python: `def main():\n    print("Hello World")\n\nif __name__ == "__main__":\n    main()`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
  cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello World";\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello World");\n    return 0;\n}`,
};

const CodeEditor = ({ socket, roomId, username, isHost, onLeave }) => {
  const [code, setCode] = useState("// Loading...");
  const [language, setLanguage] = useState("python");
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(16);
  const [users, setUsers] = useState([]);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const debouncedEmit = useCallback(
    debounce((newCode) => {
      socket.emit("code-change", { roomId, code: newCode });
    }, 300),
    [roomId, socket]
  );

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

    // --- TYPING INDICATOR LOGIC ---
    socket.on("user-typing", (user) => {
      setTypingUser(`${user} is typing...`);
      // Clear the message after 2 seconds of inactivity
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 2000);
    });

    return () => {
      socket.off("code-update");
      socket.off("language-update");
      socket.off("user-list-update");
      socket.off("code-output");
      socket.off("user-typing");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, roomId]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = (value) => {
    setCode(value);
    debouncedEmit(value);
    // Notify others that I am typing
    socket.emit("typing", { roomId, username });
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput("Running...");
    socket.emit("run-code", { roomId, language, code });
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
    const colors = [
      "#FF0000",
      "#00FF00",
      "#0088FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
      "#FFA500",
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++)
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`editor-wrapper ${theme}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          {/* GAME LOGO */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="Game Logo" style={{ height: "36px" }} />
            <h3 style={{ margin: 0 }}>Room: {roomId}</h3>
          </div>

          <div className="status-badges">
            <div className="user-count-badge">🟢 {users.length} Online</div>
            {isHost && <div className="host-badge">👑 Host</div>}
          </div>
        </div>

        <div className="users-list-compact">
          <h4>Users</h4>
          <ul>
            {users.map((u) => (
              <li key={u.id} style={{ color: getUserColor(u.username) }}>
                ● {u.username} {u.username === username && "(You)"}
              </li>
            ))}
          </ul>
        </div>

        <VoiceChat roomId={roomId} username={username} />
        <Chat socket={socket} roomId={roomId} username={username} />

        <div className="sidebar-footer">
          <div
            className="footer-buttons"
            style={{ display: "flex", gap: "10px" }}
          >
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(code)}
              style={{ flex: 1 }}
            >
              Copy Code
            </button>
            <button
              className="reset-btn"
              onClick={() => {
                setCode(BOILERPLATES[language] || "");
                socket.emit("code-change", {
                  roomId,
                  code: BOILERPLATES[language] || "",
                });
              }}
              style={{ flex: 1 }}
            >
              Reset
            </button>
          </div>
          <div className="exit-buttons">
            {isHost ? (
              <button
                className="end-btn"
                onClick={() => {
                  if (window.confirm("End meeting?")) {
                    socket.emit("end-room", { roomId });
                    onLeave();
                  }
                }}
              >
                End Meeting
              </button>
            ) : (
              <button className="leave-btn" onClick={leaveRoom}>
                Leave Room
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="main-editor">
        <div className="toolbar">
          <div className="toolbar-group">
            <select value={language} onChange={handleLanguageChange}>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
            <button className="run-btn" onClick={runCode} disabled={isRunning}>
              {isRunning ? "Running..." : "▶ Run Code"}
            </button>
          </div>
          <div className="toolbar-group">
            <label style={{ fontSize: "12px" }}>Size: {fontSize}px</label>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
            />
          </div>
          <div className="toolbar-group">
            <button
              className="theme-toggle"
              onClick={() =>
                setTheme((prev) => (prev === "vs-dark" ? "light" : "vs-dark"))
              }
            >
              {theme === "vs-dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          {/* THE TYPING INDICATOR */}
          <span className="typing-indicator">{typingUser}</span>
        </div>

        <div className="editor-area">
          <Editor
            height="70%"
            theme={theme}
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: fontSize,
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
          <div className="terminal-panel">
            <div className="terminal-header">Output Console</div>
            <pre className="terminal-content">
              {output || "Click 'Run Code' to see output here..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
