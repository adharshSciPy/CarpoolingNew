const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController.js");

router.post("/send-chat", chatController.sendMessage);
router.get("/get-chat", chatController.getChat);

module.exports = router;
