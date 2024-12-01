const express = require("express");
const router = express.Router();
const chatsServices = require("./chats.services");

// Endpoints de Chats
router.get("/chats", chatsServices.getAllChats);
router.get("/chats/:id", chatsServices.getChatById);
router.post("/chats", chatsServices.createChat);
router.put("/chats/:id", chatsServices.updateChat);
router.delete("/chats/:id", chatsServices.deleteChat);

// Endpoints de Messages
router.get("/chats/:chatId/messages", chatsServices.getMessagesByChatId);
router.post("/chats/:chatId/messages", chatsServices.createMessage);

module.exports = router;
