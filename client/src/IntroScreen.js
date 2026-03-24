import React from "react";
import "./IntroScreen.css";

const IntroScreen = ({ onProceed, exiting }) => {
  return (
    <div className={`intro-container ${exiting ? "exit" : ""}`}>
      <div className="floating-characters">
        <div
          className="char c1"
          style={{ backgroundImage: "url(/amongus.png)" }}
        />
        <div
          className="char c2"
          style={{ backgroundImage: "url(/amongus.png)" }}
        />
        <div
          className="char c3"
          style={{ backgroundImage: "url(/amongus.png)" }}
        />
      </div>

      <div className="intro-content">
        <img src="/logo.png" alt="Imposter Code" className="intro-logo" />

        <h1 className="neon-title">IMPOSTER CODE</h1>
        <p className="tagline">Solve. Suspect. Survive.</p>

        <button className="neon-btn" onClick={onProceed}>
          TAP TO PROCEED
        </button>
      </div>
    </div>
  );
};

export default IntroScreen;
