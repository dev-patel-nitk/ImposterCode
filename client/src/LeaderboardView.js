import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeaderboardView = ({ onBack }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/leaderboard");
        setLeaders(res.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-content">
        <button className="intro-btn" onClick={onBack} style={{ marginBottom: "20px", fontSize: "0.8rem" }}>
          ← REturn to lobby
        </button>

        <h1 className="cyber-title" style={{ textAlign: "center", marginBottom: "30px", fontSize: "2.5rem" }}>
          TOP <span className="highlight">OPERATIVES</span>
        </h1>

        {loading ? (
          <div className="loading-text">ACCESSING DATABANKS...</div>
        ) : (
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <span>RANK</span>
              <span>OPERATIVE</span>
              <span>XP</span>
              <span>WINS</span>
            </div>
            
            {leaders.map((player, index) => (
              <div key={player._id} className={`leaderboard-row ${index < 3 ? 'top-tier' : ''}`}>
                <div className="rank-col">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </div>
                <div className="player-col">
                  <img 
                    src={player.photo || "https://cdn-icons-png.flaticon.com/512/3242/3242257.png"} 
                    alt="avatar" 
                    className="leaderboard-avatar" 
                  />
                  <div>
                    <div className="player-name">{player.username}</div>
                    <div className="player-title">{player.rank || 'RECRUIT'}</div>
                  </div>
                </div>
                <div className="xp-col">
                  {player.xp || 0}
                </div>
                <div className="wins-col">
                  <span className="win-badge crew">C: {player.stats?.crewmate?.wins || 0}</span>
                  <span className="win-badge imp">I: {player.stats?.imposter?.wins || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardView;
