// FILE: client/src/VoiceChat.js
import React, { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

// --- PASTE YOUR AGORA APP ID BELOW ---
const APP_ID = "c5e414ba77424cde9d02545a037b1151";

const VoiceChat = ({ roomId, username }) => {
  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);

  // 🟢 FIX: Use refs to prevent stale state closures in React 18
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
        // 🟢 FIX: Use Set to prevent duplicate user counts
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

    // 🟢 FIX: Robust cleanup using refs
    return () => {
      if (trackRef.current) {
        trackRef.current.stop();
        trackRef.current.close();
      }
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, []);

  const joinVoice = async () => {
    if (!clientRef.current) return;
    try {
      // 🟢 FIX: Pass null as the 4th argument so Agora generates a safe Integer UID
      const uid = await clientRef.current.join(APP_ID, roomId, null, null);
      
      const track = await AgoraRTC.createMicrophoneAudioTrack();
      trackRef.current = track; // Save to ref
      
      await clientRef.current.publish([track]);

      setJoined(true);
      console.log("Voice connected as " + uid);
    } catch (error) {
      console.error("Voice Error:", error);
      alert("Failed to join voice chat. Check console for details.");
    }
  };

  const leaveVoice = async () => {
    if (trackRef.current) {
      trackRef.current.stop();
      trackRef.current.close();
      trackRef.current = null;
    }
    if (clientRef.current) {
      await clientRef.current.leave();
    }
    setJoined(false);
    setRemoteUsers([]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    if (trackRef.current) {
      const nextMuteState = !isMuted;
      trackRef.current.setEnabled(!nextMuteState);
      setIsMuted(nextMuteState);
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