import React from 'react';
import './ChatApp.css';

const ChatApp = () => {
  return (
    <div className="chat-container">
      <div className="chat-header">Chat Support</div>
      <div className="chat-input">
        <input type="text" placeholder="Type a message..." />
        <button>Send</button>
      </div>
    </div>
  );
};

export default ChatApp;
