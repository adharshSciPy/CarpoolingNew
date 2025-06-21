import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import './ChatListPage.css';

const ChatListPage = () => {
  const [chats, setChats] = useState([]);
  const [driverId, setDriverId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriverIdAndChats = async () => {
      try {
        // Step 1: Get driverId from Driver model using user.id
        const driverRes = await api.get(`/drivers/by-user/${user.id}`);
        const dId = driverRes.data.data._id;
        setDriverId(dId);
        console.log("✅ Resolved Driver ID:", dId);

        // Step 2: Get all chats for that driverId
        const chatRes = await api.get(`/chat/driver/${dId}`);
        console.log("✅ Chats fetched:", chatRes.data.data);
        setChats(chatRes.data.data);
      } catch (err) {
        console.error("❌ Error fetching driver or chats:", err);
      }
    };

    if (user?.id) fetchDriverIdAndChats();
  }, [user?.id]);

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">Chats</div>
      <div className="chat-list">
        {chats.map(chat => (
          <div
  key={chat._id}
  className="chat-list-item"
  onClick={() =>
    navigate("/chat", {
      state: {
        rideId: chat._id,
        userId: chat.userId._id,
        driverId: chat.driverId,
        senderId: user.id,
        senderRole: "driver"
      }
    })
  }
>
  {/* ✅ Add avatar image */}
  <img
    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.userId?.name || 'User')}&background=2563eb&color=fff&bold=true`}
    alt="avatar"
    className="avatar"
  />
  
  <div className="chat-info">
    <div className="chat-name-time">
      <span className="chat-name">{chat.userId?.name || "Unknown User"}</span>
      <span className="chat-time">
        {chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
      </span>
    </div>
    <div className="chat-message">
      {chat.messages[chat.messages.length - 1]?.text || "Start chatting"}
    </div>
  </div>
</div>

        ))}
      </div>
    </div>
  );
};

export default ChatListPage;
