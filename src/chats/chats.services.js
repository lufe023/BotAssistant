const chatServices = require("./chats.controllers");

// servicios de mis Chats
const getAllMyChats = async (req, res) => {
    const { id } = req.user;
    try {
        const chats = await chatServices.getAllMyChats(id);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// servicios de todos Chats
const getAllChats = async (req, res) => {
    try {
        const chats = await chatServices.getAllchats();
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChatById = async (req, res) => {
    try {
        const chat = await chatServices.getChatById(req.params.id);
        if (!chat) return res.status(404).json({ message: "Chat not found" });
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createChat = async (req, res) => {
    try {
        const chat = await chatServices.createChat(req.body.userId);
        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateChat = async (req, res) => {
    try {
        const chat = await chatServices.updateChat(req.params.id, req.body);
        if (!chat) return res.status(404).json({ message: "Chat not found" });
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteChat = async (req, res) => {
    try {
        const success = await chatServices.deleteChat(req.params.id);
        if (!success)
            return res.status(404).json({ message: "Chat not found" });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controladores de Messages
const getMessagesByChatId = async (req, res) => {
    try {
        const messages = await chatServices.getMessagesByChatId(
            req.params.chatId
        );
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMessage = async (req, res) => {
    try {
        const message = await chatServices.createMessage(
            req.params.chatId,
            req.body,
            req.user.id
        );
        res.status(201).json(message);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllChats,
    getAllMyChats,
    getChatById,
    createChat,
    updateChat,
    deleteChat,
    getMessagesByChatId,
    createMessage,
};
