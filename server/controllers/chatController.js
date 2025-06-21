const Chat=require("../models/chat.js")

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

