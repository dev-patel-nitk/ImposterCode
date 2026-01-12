// FILE: client/src/VoiceChat.js
import React, { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

// --- PASTE YOUR AGORA APP ID BELOW ---
const APP_ID = "89e7ad8b8798488f82aafeae54d252c6";

const VoiceChat = ({ roomId, username }) => {
  const [client, setClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);

  useEffect(() => {
    const initAgora = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setClient(agoraClient);

      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        if (mediaType === "audio") {
          user.audioTrack.play();
          setRemoteUsers((prev) => [...prev, user.uid]);
        }
      });

      agoraClient.on("user-unpublished", (user) => {
        setRemoteUsers((prev) => prev.filter((uid) => uid !== user.uid));
      });

      agoraClient.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((uid) => uid !== user.uid));
      });
    };

    initAgora();

    return () => {
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (client) {
        client.leave();
      }
    };
    // eslint-disable-next-line
  }, []);

  const joinVoice = async () => {
    if (!client) return;
    try {
      const uid = await client.join(APP_ID, roomId, null, username);
      const track = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(track);
      await client.publish([track]);

      setJoined(true);
      console.log("Voice connected as " + uid);
    } catch (error) {
      console.error("Voice Error:", error);
      alert("Failed to join voice chat. Check AppID/Console.");
    }
  };

  const leaveVoice = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }
    await client.leave();
    setJoined(false);
    setRemoteUsers([]);
  };

  const toggleMute = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(isMuted);
      setIsMuted(!isMuted);
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
