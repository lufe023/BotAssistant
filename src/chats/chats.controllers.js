const uuid = require("uuid");
const Chats = require("../models/chats.models");
const Messages = require("../models/messages.models");
const { initializeClient, getClient } = require("../whatsapp/whatsappClient");
const {
    sendNotification,
} = require("../notifications/notifications.controllers");
const { Op } = require("sequelize");
const Users = require("../models/users.models");
const { getUserById } = require("../users/users.controllers");

// controladores de Chats
const getAllMyChats = async (id) => {
    return await Chats.findAll({
        where: {
            [Op.or]: [{ userId: id }, { agentId: id }],
        },
    });
};

// controladores de Chats
const getAllchats = async () => {
    const chats = await Chats.findAll({
        where: { status: "active" },
        include: [
            { model: Users, as: "user" },
            { model: Messages, as: "messages" },
        ],
    });

    return chats;
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
    const messageCreate = await Messages.create({
        id: uuid.v4(),
        chatId,
        senderId, // Lo obtenemos del token
        receiverId: data.receiverId, // A quién va dirigido el mensaje
        message: data.message,
        sentAt: new Date(),
    });

    const getUserPhone = await getUserById(data.receiverId);

    await sentToWhatsapp(getUserPhone.phone, data.message);

    return messageCreate;
};

const createMessageToAgent = async (chatId, data, senderId) => {
    if (!data.message) {
        throw new Error('El campo "message" es obligatorio');
    }

    if (!data.receiverId) {
        throw new Error('El campo "receiverId" es obligatorio');
    }
    const messageCreate = await Messages.create({
        id: uuid.v4(),
        chatId,
        senderId, // Lo obtenemos del token
        receiverId: data.receiverId, // A quién va dirigido el mensaje
        message: data.message,
        sentAt: new Date(),
    });

    return messageCreate;
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

const sentToWhatsapp = async (chatId, message) => {
    let number = `${chatId}@c.us`;

    const client = getClient(); // Obtén el cliente de WhatsApp
    await client.sendMessage(number, message);
};

module.exports = {
    getAllchats,
    getAllMyChats,
    getChatById,
    createChat,
    updateChat,
    deleteChat,
    getMessagesByChatId,
    createMessage,
    createChatWithMessage,
    createChatWithNotification,
};
