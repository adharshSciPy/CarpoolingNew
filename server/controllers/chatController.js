const Chat=require("../models/chat.js")
const AdminWallet=require('../models/adminWallet.js')

exports.sendMessage = async (req, res) => {
  const { rideId, userId, driverId, senderId, senderRole, text } = req.body;

  if (!rideId || !userId || !driverId || !senderId || !senderRole || !text) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    let chat = await Chat.findOne({ userId, driverId });

    const message = {
      senderType: senderRole,
      senderId,
      text
    };

    if (!chat) {
      chat = new Chat({
        userId,
        driverId,
        messages: [message]
      });
    } else {
      chat.messages.push(message);
    }

    await chat.save();

    res.status(200).json({ success: true, message: "Message sent", data: chat });
  } catch (err) {
    console.error("Send Chat Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET /api/v1/chat/get-chat?userId=...&driverId=...
exports.getChat = async (req, res) => {
  const { userId, driverId } = req.query;

  if (!userId || !driverId) {
    return res.status(400).json({ success: false, message: "User ID and Driver ID are required" });
  }

  try {
    const chat = await Chat.findOne({ userId, driverId })
      .populate("userId", "name")
      .populate("driverId", "user");

    if (!chat) {
  return res.status(200).json({
    success: true,
    data: {
      userId,
      driverId,
      messages: [],
    }
  });
}


    res.status(200).json({ success: true, data: chat });
  } catch (err) {
    console.error("Get Chat Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// GET /api/v1/chat/driver/:driverId
exports.getChatsForDriver = async (req, res) => {
  const { driverId } = req.params;

  if (!driverId) {
    return res.status(400).json({ success: false, message: "Driver ID is required" });
  }

  try {
    const chats = await Chat.find({ driverId })
      .populate("userId", "name phone") // Optional: populate user details
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: chats });
  } catch (err) {
    console.error("Error fetching driver chats:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


exports.getAdminWallet = async (req, res) => {
  try {
    const records = await AdminWallet.find().sort({ _id: -1 }); // optional: sort newest first
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    console.error("Fetch Admin Wallet Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch admin wallet data" });
  }
};