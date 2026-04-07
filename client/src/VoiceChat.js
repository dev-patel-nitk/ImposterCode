// FILE: client/src/VoiceChat.js
import React, { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

// --- PASTE YOUR AGORA APP ID BELOW ---
const APP_ID = "c5e414ba77424cde9d02545a037b1151";

const VoiceChat = ({ roomId, username }) => {
  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);

  // Use refs to prevent stale state closures in React 18
  const clientRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    // 1. Initialize client inside ref
    clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    const client = clientRef.current;

    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "audio") {
        user.audioTrack.play();
        // Use Set to prevent duplicate user counts
        setRemoteUsers((prev) => [...new Set([...prev, user.uid])]);
      }
    };

    const handleUserUnpublished = (user) => {
      setRemoteUsers((prev) => prev.filter((uid) => uid !== user.uid));
    };

    const handleUserLeft = (user) => {
      setRemoteUsers((prev) => prev.filter((uid) => uid !== user.uid));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    // Robust cleanup using refs
    return () => {
      if (trackRef.current) {
        trackRef.current.stop();
        trackRef.current.close();
      }
      if (clientRef.current) {
        // Disconnect gracefully when component unmounts
        const state = clientRef.current.connectionState;
        if (state === 'CONNECTED' || state === 'CONNECTING') {
          clientRef.current.leave().catch(err => console.error("Cleanup error:", err));
        }
      }
    };
  }, []);

  const joinVoice = async () => {
    if (!clientRef.current) return;

    // 🟢 THE GHOST KILLER: Check state via the ref to prevent crashes
    const state = clientRef.current.connectionState;
    if (state === 'CONNECTED' || state === 'CONNECTING') {
      console.warn("Ghost connection detected. Forcing disconnect first...");
      await clientRef.current.leave();
    }

    try {
      // Pass null as the 4th argument so Agora generates a safe Integer UID
      const uid = await clientRef.current.join(APP_ID, roomId, null, null);
      
      // 🟢 Create mic track (This is where laptops usually fail due to permissions)
      const track = await AgoraRTC.createMicrophoneAudioTrack();
      trackRef.current = track; // Save to ref
      
      await clientRef.current.publish([track]);

      setJoined(true);
      console.log("Voice connected as " + uid);
    } catch (error) {
      console.error("Voice Error:", error);
      
      // 🟢 LAPTOP FIX: Explicitly warn if it's a mic permission issue
      if (error.message && error.message.includes("NotAllowedError")) {
        alert("Microphone access denied! Please click the lock icon in your browser's URL bar and allow microphone access.");
      } else {
        alert("Failed to join voice chat. Check console for details.");
      }
    }
  };

  const leaveVoice = async () => {
    if (trackRef.current) {
      trackRef.current.stop();
      trackRef.current.close();
      trackRef.current = null;
    }
    if (clientRef.current) {
      const state = clientRef.current.connectionState;
      if (state === 'CONNECTED' || state === 'CONNECTING') {
        await clientRef.current.leave();
      }
    }
    setJoined(false);
    setRemoteUsers([]);
    setIsMuted(false);
  };

  const toggleMute = async () => {
    if (trackRef.current) {
      try {
        const nextMuteState = !isMuted;
        // setMuted keeps the mic device active but sends silent frames, 
        // avoiding the slow hardware spin-up associated with setEnabled()
        await trackRef.current.setMuted(nextMuteState);
        setIsMuted(nextMuteState);
      } catch (err) {
        console.error("Failed to toggle mute:", err);
      }
    }
  };

  return (
    <div
      className="voice-chat-panel"
      style={{
        padding: "15px",
        borderTop: "1px solid #444",
        background: "rgba(0,0,0,0.2)",
      }}
    >
      <h4 style={{ marginTop: 0, color: "#ccc", fontSize: "0.9rem" }}>
        🔊 Voice Chat
      </h4>

      {!joined ? (
        <button
          onClick={joinVoice}
          style={{
            width: "100%",
            padding: "8px",
            background: "#2ea043",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Join Voice Channel
        </button>
      ) : (
        <div className="voice-controls">
          <div
            style={{ marginBottom: "10px", fontSize: "0.85rem", color: "#888" }}
          >
            {remoteUsers.length > 0
              ? `Talking with ${remoteUsers.length} others`
              : "Waiting for others..."}
          </div>

          <div style={{ display: "flex", gap: "5px" }}>
            <button
              onClick={toggleMute}
              style={{
                flex: 1,
                padding: "8px",
                background: isMuted ? "#da3633" : "#3e3e42",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={leaveVoice}
              style={{
                flex: 1,
                padding: "8px",
                background: "#3e3e42",
                color: "#ccc",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;