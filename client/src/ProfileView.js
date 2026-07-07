import React from 'react';

const ProfileView = ({ crewmate, onBack, isOwnProfile, onUpload }) => {
  // Destructure database fields provided by App.js
  const { 
    username = "UNKNOWN", 
    rank = "RECRUIT", 
    preferredLanguage = "C++", 
    stats = { 
      crewmate: { wins: 0 }, 
      imposter: { wins: 0 } 
    }, 
    xp = 0, 
    avatar
  } = crewmate || {};

  return (
    <div className="app-container profile-view" style={{ 
      background: "radial-gradient(circle at center, #0b1c24 0%, #000 100%)",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "20px" }}>
        
        {/* Navigation Button linked to setView("lobby") in App.js */}
        <button 
          onClick={onBack}
          className="intro-btn"
          style={{ marginBottom: "30px", fontSize: "0.7rem", padding: "8px 16px" }}
        >
          ← RETURN TO LOBBY
        </button>

        {/* Glowing Avatar Frame with Scan Line */}
        <div className="avatar-frame">
          <img 
            src={avatar || "https://cdn-icons-png.flaticon.com/512/3242/3242257.png"} 
            alt="Identity" 
          />
          {isOwnProfile && (
            <label className="upload-overlay">
              UPDATE IDENTITY
              <input 
                type="file" 
                style={{ display: 'none' }} 
                onChange={onUpload} 
                accept="image/*" 
              />
            </label>
          )}
          <div className="scan-line"></div>
        </div>

        {/* Username Display with Orbitron Font */}
        <h1 className="profile-name" style={{ textAlign: "center", fontSize: "2.5rem", margin: "10px 0" }}>
          {username}
        </h1>
        
        <p style={{ 
          textAlign: "center", 
          color: "var(--neon-cyan)", 
          fontSize: "0.8rem", 
          letterSpacing: "3px", 
          marginBottom: "40px",
          textTransform: "uppercase" 
        }}>
          {rank} | {isOwnProfile ? "CURRENT USER" : "VIEWING DOSSIER"}
        </p>

        {/* Performance Stats with JetBrains Mono for the slashed zero (Ø) */}
        <div style={{ width: "100%", borderTop: "1px solid #333", paddingTop: "20px" }}>
          <p style={{ fontSize: "0.6rem", color: "#666", letterSpacing: "2px", marginBottom: "20px", textAlign: "center" }}>
            MISSION PERFORMANCE
          </p>
          
          <StatRow label="TOTAL WINS (CREWMATE)" value={stats?.crewmate?.wins || 0} />
          <StatRow label="TOTAL WINS (IMPOSTER)" value={stats?.imposter?.wins || 0} />
          
          <div className="detail-row">
            <label>PREFERRED LANGUAGE</label>
            <span style={{ color: "var(--neon-cyan)", fontWeight: "bold" }}>{preferredLanguage}</span>
          </div>
          
          <StatRow label="RANKING POINTS" value={xp} suffix="XP" />
        </div>

        {/* Identity Scan Status */}
        <div className="scan-status" style={{ 
          marginTop: "40px", 
          textAlign: "center", 
          color: "var(--neon-cyan)", 
          fontSize: "0.9rem", 
          letterSpacing: "4px",
          opacity: "0.7"
        }}>
          IDENTITY SCAN COMPLETE
        </div>
      </div>
    </div>
  );
};

// Sub-component to handle the "Ø" (slashed zero) logic consistently
const StatRow = ({ label, value, suffix = "" }) => (
  <div className="detail-row">
    <label>{label}</label>
    <span style={{ 
      fontFamily: "'JetBrains Mono', monospace", 
      fontWeight: "bold",
      color: "white" 
    }}>
      {/* Changed "Ø" back to value to show the actual number 0 */}
      {value} {suffix}
    </span> 
  </div>
);
export default ProfileView;