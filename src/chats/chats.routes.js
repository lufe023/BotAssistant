const express = require("express");
const router = express.Router();
const chatsServices = require("./chats.services");
const { initializeClient, getClient } = require("../whatsapp/whatsappClient");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware");
// Endpoints de Chats
router.get(
    "/me",
    passport.authenticate("jwt", { session: false }),
    chatsServices.getAllMyChats
);
router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    chatsServices.getAllChats
);
router.get("/chats/:id", chatsServices.getChatById);
router.post("/chats", chatsServices.createChat);
router.patch("/chats/:id", chatsServices.updateChat);
router.delete("/chats/:id", chatsServices.deleteChat);

// Endpoints de Messages
router.get("/chats/:chatId/messages", chatsServices.getMessagesByChatId);
router.post(
    "/chats/:chatId/messages",
    passport.authenticate("jwt", { session: false }),
    chatsServices.createMessage
);

router.post("/send-message", async (req, res) => {
    // const chatId = `${number}@c.us`;

    try {
        const { chatId, message } = req.body;

        if (!chatId || !message) {
            return res
                .status(400)
                .json({ error: "chatId y message son requeridos." });
        }

        const client = getClient(); // Obtén el cliente de WhatsApp
        await client.sendMessage(chatId, message);

        res.status(200).json({
            success: true,
            message: "Mensaje enviado con éxito.",
        });
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
