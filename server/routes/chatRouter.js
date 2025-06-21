const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController.js");

router.post("/send-chat", chatController.sendMessage);
router.get("/get-chat", chatController.getChat);
router.get("/driver/:driverId", chatController.getChatsForDriver);
router.get('/admin-wallet',  chatController.getAdminWallet);


module.exports = router;
