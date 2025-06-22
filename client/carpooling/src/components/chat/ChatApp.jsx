import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import './ChatApp.css';

const ChatApp = () => {
  const location = useLocation();
  const {
    rideId,
    userId,
    driverId,
    senderId,
    senderRole,
  } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await api.get(`/chat/get-chat?userId=${userId}&driverId=${driverId}`);
        setMessages(res.data.data.messages);
      } catch (err) {
        console.error("Error fetching chat:", err);
      }
    };

    if (userId && driverId) fetchChat();
  }, [userId, driverId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const res = await api.post('/chat/send-chat', {
        rideId,
        userId,
        driverId,
        senderId,
        senderRole,
        text
      });
      setMessages(res.data.data.messages);
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Chat Support</div>
      <div className="chat-messages">
{messages.length === 0 ? (
  <div className="chat-welcome">Welcome to a new chat!</div>
) : (
  messages.map((msg, idx) => (
    <div
      key={idx}
      className={`chat-message-row ${msg.senderType === senderRole ? 'self' : 'other'}`}
    >
      <div className="chat-bubble">
        <div className="chat-text">{msg.text}</div>
        <div className="chat-time">
          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  ))
)}

</div>

      <div className="chat-input">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatApp;
