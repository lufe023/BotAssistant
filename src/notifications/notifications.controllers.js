//notifications.controller.js
const Notifications = require("../models/notifications.models");
const uuid = require("uuid");
// Configurar la instancia de io
const setIoInstance = (socketIoInstance) => {
    io = socketIoInstance;
};

// notifications.controller.js
let connectedUsers = new Map(); // Mapa de usuarios conectados

const setNotificationsUsers = (userId, socketId) => {
    connectedUsers.set(userId, socketId); // Asociar userId con socketId
    console.log("Usuarios conectados:", Array.from(connectedUsers.entries()));
};

const { getConnectedUsers } = require("../utils/socketManager");

const getAllNotifications = async (offset, limit) => {
    const data = await Notifications.findAndCountAll({
        offset: offset,
        limit: limit,
    });
    return data;
};

const getNotificationById = async (id) => {
    return await Notifications.findByPk(id);
};

const getNotificationByuser = async (id) => {
    return await Notifications.findAll({
        where: {
            userId: id,
            isRead: false,
        },
        limit: 15, // Limitar a las 10 notificaciones no leídas más recientes
        order: [["createdAt", "DESC"]], // Ordenar por la fecha de creación de manera descendente
    });
};

const createNotification = async (notificationData) => {
    // {
    //     destination: { userId: "ID_DEL_USUARIO_DESTINO" }, // Destinatario de la notificación
    //     type: "tipo_de_notificación", // Define el propósito (e.g., "new_message", "request_agent", etc.)
    //     title: "Título de la notificación", // Breve descripción del propósito
    //     message: "Mensaje detallado para el usuario", // Mensaje que recibirá el usuario
    //     manifest: { key: "value", }, // Detalles específicos para cada tipo de notificación
    //     createdAt: "2024-11-28T10:00:00Z" // Fecha de creación (puede omitirse y se asignará por defecto)
    // }
    const newNotification = await Notifications.create({
        id: uuid.v4(),
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        status: notificationData.status,
        createdAt: notificationData.createdAt || new Date(),
        userId: notificationData.userId,
    });
    console.log("Los usuarios conectados son: " + connectedUsers);
    // Obtener el socketId del usuario específico
    //const socketId = connectedUsers.get(notificationData.destination.userId);
    if (io) {
        io.emit("new-notification", {
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type,
        });
        console.log(
            `Notificación enviada a Usuario ${notificationData.userId}`
        );
    } else {
        console.error(
            `Usuario ${notificationData.userId} no está conectado o Socket.IO no está disponible.`
        );
    }

    // if (io && socketId) {
    //     io.to(socketId).emit("new-notification", {
    //         title: notificationData.title,
    //         message: notificationData.message,
    //         type: notificationData.type,
    //     });
    //     console.log(
    //         `Notificación enviada a Usuario ${notificationData.userId}`
    //     );
    // } else {
    //     console.error(
    //         `Usuario ${notificationData.userId} no está conectado o Socket.IO no está disponible.`
    //     );
    // }

    return newNotification;
};

const updateNotification = async (id, notificationData) => {
    const [updated] = await Notifications.update(notificationData, {
        where: { id },
    });
    return updated ? await Notifications.findByPk(id) : null;
};

const deleteNotification = async (id) => {
    return await Notifications.destroy({
        where: { id },
    });
};

const sendNotification = (userId, type, data = {}) => {
    const io = getSocketIoInstance();
    const connectedUsers = getConnectedUsers();
    const socketId = connectedUsers.get(userId);

    if (socketId) {
        io.to(socketId).emit("new-notification", { type, ...data });
        console.log(`Notificación enviada a Usuario ${userId}`);
    } else {
        console.log(`Usuario ${userId} no está conectado`);
    }
};

// Función para notificar un nuevo mensaje
const notifyNewMessage = (userId, messageContent) => {
    sendNotification(userId, "new_message", { content: messageContent });
};

// Función para notificar cambio de estado en un chat
const notifyChatStatusChange = (userId, newStatus) => {
    sendNotification(userId, "chat_status_change", { status: newStatus });
};

// Función para notificar asignación de agente
const notifyAgentAssigned = (userId, agentName) => {
    sendNotification(userId, "agent_assigned", { agent: agentName });
};

// Función para notificar comprobante recibido
const notifyVoucherReceived = (userId, voucherDetails) => {
    sendNotification(userId, "voucher_received", { voucher: voucherDetails });
};

// Función para notificar solicitud de agente
const notifyUserRequestAgent = (userId) => {
    sendNotification(io, userId, "user_request_agent", {});
};

// Función para notificar chat cerrado
const notifyChatClosed = (userId) => {
    sendNotification(userId, "chat_closed", {});
};

// Función para notificar recordatorio
const notifyReminder = (userId, reminderDetails) => {
    sendNotification(userId, "reminder", { reminder: reminderDetails });
};

module.exports = {
    getAllNotifications,
    getNotificationById,
    getNotificationByuser,
    createNotification,
    updateNotification,
    deleteNotification,
    sendNotification,
    setIoInstance,
    setNotificationsUsers,
};
