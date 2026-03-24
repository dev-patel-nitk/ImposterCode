import React from "react";
import "./GameOverScreen.css";

const GameOverScreen = ({ data, onExit }) => {
  if (!data) return null;

  // CASE 1: NO RESULT
  if (data.type === "NO_RESULT") {
    return (
      <div className="gameover-root">
        <div className="gameover-card">
          <h1 className="gameover-title neutral">MISSION ENDED</h1>
          <p className="gameover-sub">{data.message}</p>

          <button className="gameover-btn" onClick={onExit}>
            RETURN TO LOBBY
          </button>
        </div>
      </div>
    );
  }

  // CASE 2: RESULT
  const isCrewWin = data.result === "CREWMATE_WIN";

  return (
    <div className="gameover-root">
      <div className="gameover-card">
        <h1 className={`gameover-title ${isCrewWin ? "crew" : "impostor"}`}>
          {isCrewWin ? "CREWMATES WIN" : "IMPOSTOR WINS"}
        </h1>

        <h3 className="reveal-title">ROLE REVEAL</h3>

        <div className="role-list">
          {data.roles.map((p) => (
            <div
              key={p.id}
              className={`role-row ${
                p.role === "IMPOSTOR" ? "impostor" : "crew"
              }`}
            >
              <span>{p.username}</span>
              <span>{p.role}</span>
            </div>
          ))}
        </div>

        <button className="gameover-btn" onClick={onExit}>
          RETURN TO LOBBY
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
