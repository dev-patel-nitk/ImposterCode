// FILE: client/src/EmergencyMeeting.js
import React, { useState, useEffect, useRef } from "react";
import useSoundEffects from "./hooks/useSoundEffects";

const EmergencyMeeting = ({ users, caller, timeLeft, onVote, kickedIds, currentUserId }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  
  // OPTIMIZATION: Initialize once, don't sync constantly to avoid loops
  const [localTimer, setLocalTimer] = useState(timeLeft);
  const { playSound } = useSoundEffects();
  const timerRef = useRef(timeLeft);

  useEffect(() => {
    // Sync only on mount or if server time drifts significantly (optional logic)
    timerRef.current = timeLeft;
    setLocalTimer(timeLeft);

    const interval = setInterval(() => {
      setLocalTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        if (prev <= 6) {
          playSound("BEEP"); // Tick sound for last 5 seconds (plays going into 5, 4, 3, 2, 1)
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // 🟢 CRITICAL FIX: Empty dependency array or only specific triggers prevents loop
  }, []); 

  const handleConfirmVote = () => {
    if (selectedId && !hasVoted) {
      onVote(selectedId);
      setHasVoted(true);
    }
  };

  const handleSkip = () => {
    if (!hasVoted) {
      onVote("SKIP");
      setHasVoted(true);
    }
  };

  return (
    <div className="emergency-overlay">
      <div className="emergency-container">
        
        {/* Header */}
        <div className="emergency-header">
          <h1>🚨 EMERGENCY MEETING 🚨</h1>
          <p className="caller-text">Called by: <span className="highlight">{caller}</span></p>
          <div className={`meeting-timer ${localTimer <= 10 ? "panic" : ""}`}>
            {localTimer}s
          </div>
        </div>

        {/* Voting Grid */}
        <div className="voting-grid">
          {users.map((u) => {
            const isDead = kickedIds.includes(u.id);
            const isMe = u.id === currentUserId;
            
            return (
              <div 
                key={u.id} 
                className={`voter-card ${selectedId === u.id ? "selected" : ""} ${isDead ? "dead" : ""}`}
                onClick={() => !isDead && !hasVoted && setSelectedId(u.id)}
              >
                <div className="voter-avatar">
                  {isDead ? "💀" : "👤"}
                </div>
                <div className="voter-info">
                  <span className="voter-name">{u.username} {isMe && "(You)"}</span>
                  {isDead && <span className="dead-tag">EJECTED</span>}
                </div>
                {/* Visual feedback for selection */}
                {selectedId === u.id && !hasVoted && !isDead && (
                   <div className="vote-indicator">TARGET</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="voting-actions">
          {!hasVoted ? (
            <div className="action-row">
              <button className="skip-btn" onClick={handleSkip}>
                SKIP VOTE ☁️
              </button>
              <button 
                className="confirm-vote-btn" 
                disabled={!selectedId} 
                onClick={handleConfirmVote}
              >
                CONFIRM VOTE 🗳️
              </button>
            </div>
          ) : (
            <div className="voted-status">
              <h3>VOTE CAST</h3>
              <div className="loading-dots">Waiting for others...</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EmergencyMeeting;