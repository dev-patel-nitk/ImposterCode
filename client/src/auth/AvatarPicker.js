import React from "react";
import "./AvatarPicker.css";

const avatars = [
  "Crewmate.png",
  "Crewmate_red.png",
  "Crewmate_purple.png",
  "Host.png",
  "imposter.png",
  "impo.webp",
];

const AvatarPicker = ({ selectedAvatar, setSelectedAvatar }) => {
  return (
    <div className="avatar-picker">
      <div className="avatar-grid">
        {avatars.map((avatar) => (
          <div
            key={avatar}
            className={`avatar-item ${
              selectedAvatar === avatar ? "selected" : ""
            }`}
            onClick={() => setSelectedAvatar(avatar)}
          >
            <img
              // Using PUBLIC_URL ensures it always points to your public folder
              src={`${process.env.PUBLIC_URL}/avatars/${avatar}`}
              alt={avatar}
              draggable={false}
              className="avatar-img"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarPicker;