// FILE: client/src/RoleReveal.js
import React, { useEffect, useState } from "react";

const RoleReveal = ({ role }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation slightly after mount for smooth transition
    requestAnimationFrame(() => setAnimate(true));
  }, []);

  const isImpostor = role === "Impostor";
  const color = isImpostor ? "var(--neon-red)" : "var(--neon-cyan)";
  const bgColor = isImpostor ? "rgba(20, 0, 0, 0.95)" : "rgba(0, 20, 25, 0.95)";

  return (
    <div className="role-reveal-overlay" style={{ backgroundColor: bgColor }}>
      <div className={`role-content ${animate ? "enter" : ""}`}>
        
        <h2 className="role-header">ROLE ASSIGNED</h2>
        
        <h1 className="role-title" style={{ color: color, textShadow: `0 0 30px ${color}` }}>
          {isImpostor ? "IMPOSTOR" : "CREWMATE"}
        </h1>

        <div className="role-description">
          {isImpostor ? (
            <p style={{ color: "#ff4444" }}>
              Sabotage the code. Blend in. <br /> Don't get caught.
            </p>
          ) : (
            <p style={{ color: "#44ffff" }}>
              Solve problems. Fix bugs. <br /> Find the Impostor.
            </p>
          )}
        </div>

        {/* Character Icon Animation */}
        <div className="role-avatar">
          {isImpostor ? "🤫" : "🫡"}
        </div>

      </div>
    </div>
  );
};

export default RoleReveal;