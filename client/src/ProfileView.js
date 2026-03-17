// FILE: client/src/ProfileView.js
import React from "react";

// 🟢 THEMED DEFAULT IMAGE
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/3242/3242257.png";

const ProfileView = ({ crewmate, onBack, isOwnProfile, onUpload }) => {
  if (!crewmate) return null;

  return (
    <div className="app-container profile-view">
      <div className="profile-card">
        <button className="back-btn" onClick={onBack}>
          ← RETURN TO LOBBY
        </button>

        <div className="profile-content">
          <div className="profile-identity">
            <div className="avatar-frame">
              {/* 🟢 Fallback Image logic */}
              <img src={crewmate.photo || DEFAULT_AVATAR} alt="Identity" />
              
              {isOwnProfile && (
                <label className="upload-overlay">
                  <input type="file" hidden onChange={onUpload} accept="image/*" />
                  <span>UPDATE PHOTO</span>
                </label>
              )}
            </div>
            <h1 className="profile-name">{crewmate.username}</h1>
            <p className="profile-status">
              {isOwnProfile ? "CURRENT USER / VERIFIED" : "ONLINE / VERIFIED"}
            </p>
          </div>

          <div className="login-divider"><span>DATA RECORDS</span></div>

          <div className="profile-details">
            <div className="detail-row">
              <label>ACCOUNT TYPE</label>
              <span>{crewmate.isGuest ? "GUEST PASS" : "REGISTERED PILOT"}</span>
            </div>
            <div className="detail-row">
              <label>DATABASE ID</label>
              <span className="mono-text">
                {crewmate._id ? crewmate._id.slice(-8).toUpperCase() : "LOCAL_ONLY"}
              </span>
            </div>
          </div>

          <div className="scanner-footer">
            <div className="scan-line"></div>
            <p>IDENTITY SCAN COMPLETE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;