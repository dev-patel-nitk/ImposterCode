import React, { useState } from "react";
import AvatarPicker from "./AvatarPicker";

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const handleRegister = async () => {
    // Basic Validation
    if (!username.trim()) {
      alert("Username is required");
      return;
    }

    if (!password.trim()) {
      alert("Password is required");
      return;
    }

    if (!selectedAvatar) {
      alert("Please select an avatar");
      return;
    }

    try {
      // API call to your Node.js backend
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          avatar: selectedAvatar, // This sends the filename/ID of the Among Us character
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        // If you have a callback to handle login state or navigation
        if (onRegister) {
          onRegister(data.user);
        }
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Your Profile</h2>

      <input
        style={styles.input}
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* AVATAR PICKER */}
      <p style={styles.label}>Choose Your Avatar</p>
      <AvatarPicker
        selectedAvatar={selectedAvatar}
        setSelectedAvatar={setSelectedAvatar}
      />

      <button 
        style={styles.button} 
        onClick={handleRegister}
        onMouseOver={(e) => (e.target.style.boxShadow = "0 0 20px #00f3ff")}
        onMouseOut={(e) => (e.target.style.boxShadow = "none")}
      >
        Register
      </button>
    </div>
  );
};

const styles = {
  container: {
    width: "400px",
    margin: "60px auto",
    padding: "40px",
    background: "#0a0a0c", // Deep dark background from your screenshot
    borderRadius: "15px",
    textAlign: "center",
    color: "#00f3ff", // Cyan neon
    border: "2px solid #1a1a1e",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  title: {
    marginBottom: "30px",
    fontSize: "24px",
    textTransform: "uppercase",
    letterSpacing: "2px",
    fontFamily: "'Orbitron', sans-serif", // Matching your "IDENTIFY YOURSELF" font
  },
  label: {
    margin: "20px 0 10px",
    fontSize: "14px",
    color: "#00f3ff",
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#16161a",
    color: "#fff",
    outline: "none",
    transition: "border 0.3s ease",
  },
  button: {
    width: "100%",
    padding: "14px",
    marginTop: "25px",
    border: "none",
    borderRadius: "8px",
    background: "#00f3ff",
    color: "#000",
    fontWeight: "bold",
    fontSize: "16px",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};

export default Register;