import React, { useEffect, useState } from "react";
import "./AuthScreen.css";
import amongus from "./assets/amongus.png";

const AuthScreen = ({ username, setUsername, onSubmit,exiting }) => {
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    // trigger animation on mount
    requestAnimationFrame(() => setEnter(true));
  }, []);

  return (
    <div className={`auth-container ${enter ? "enter" : ""} ${exiting ? "exit" : ""}`}>
      <div className="watchers">
        <div
          className="watcher w1"
          style={{ backgroundImage: `url(${amongus})` }}
        />
        <div
          className="watcher w2"
          style={{ backgroundImage: `url(${amongus})` }}
        />
        <div
          className="watcher w3"
          style={{ backgroundImage: `url(${amongus})` }}
        />
      </div>

      <div className="auth-box">
        <h2>IDENTIFICATION REQUIRED</h2>
        <input
          placeholder="Enter Codename..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => document.body.classList.add("typing")}
          onBlur={() => document.body.classList.remove("typing")}
        />

        <button onClick={onSubmit}>CONFIRM</button>
      </div>
    </div>
  );
};

export default AuthScreen;
