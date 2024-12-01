const uuid = require("uuid");
const Chats = require("../models/chats.models");
const Messages = require("../models/messages.models");
const {
    sendNotification,
} = require("../notifications/notifications.controllers");

// controladores de Chats
const getAllChats = async () => {
    return await Chats.findAll();
};

const getChatById = async (id) => {
    return await Chats.findByPk(id);
};

const createChat = async (userId) => {
    return await Chats.create({
        id: uuid.v4(),
        userId,
        status: "waiting",
    });
};

const updateChat = async (id, data) => {
    const chat = await Chats.findByPk(id);
    if (!chat) return null;
    return await chat.update(data);
};

const deleteChat = async (id) => {
    const chat = await Chats.findByPk(id);
    if (!chat) return null;
    await chat.destroy();
    return true;
};

// Servicios de Messages
const getMessagesByChatId = async (chatId) => {
    return await Messages.findAll({ where: { chatId } });
};

const createMessage = async (chatId, data, senderId) => {
    if (!data.message) {
        throw new Error('El campo "message" es obligatorio');
    }

    if (!data.receiverId) {
        throw new Error('El campo "receiverId" es obligatorio');
    }

    return await Messages.create({
        id: uuid.v4(),
        chatId,
        senderId, // Lo obtenemos del token
        receiverId: data.receiverId, // A quién va dirigido el mensaje
        message: data.message,
        sentAt: new Date(),
    });
};

const createChatWithMessage = async (chatData, initialMessageData) => {
    try {
        // Crear el chat
        const newChat = await Chats.create({
            id: uuid.v4(),
            userId: chatData.userId,
            agentId: chatData.agentId,
            status: "active", // Estado inicial del chat
            createdAt: new Date(),
        });

        // Crear el mensaje inicial
        const newMessage = await Messages.create({
            id: uuid.v4(),
            chatId: newChat.id,
            senderId: initialMessageData.senderId,
            content: initialMessageData.content || "El chat ha sido iniciado.",
            message: initialMessageData.message,
            createdAt: new Date(),
        });

        return { chat: newChat, message: newMessage };
    } catch (error) {
        console.error("Error al crear el chat y el mensaje inicial:", error);
        throw new Error("No se pudo crear el chat.");
    }
};

const createChatWithNotification = async (userId, initialMessage) => {
    // Crear el chat
    const chat = await createChat(userId);

    // Crear el mensaje inicial
    await createMessage(chat.id, {
        senderId: userId,
        content: initialMessage,
    });

    // Enviar notificación al usuario
    sendNotification(userId, "new_message", {
        chatId: chat.id,
        message: initialMessage,
    });

    return chat;
};

module.exports = {
    getAllChats,
    getChatById,
    createChat,
    updateChat,
    deleteChat,
    getMessagesByChatId,
    createMessage,
    createChatWithMessage,
    createChatWithNotification,
};
