
import React, { useState, useEffect, useRef } from "react";

const Chat = ({ socket, roomId, username }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("receive-chat-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive-chat-message");
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send-chat-message", { roomId, message, username });
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Room Chat</div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.username === username ? "my-message" : "other-message"}`}
          >
            <span className="msg-user">{msg.username}</span>
            <span className="msg-text">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;