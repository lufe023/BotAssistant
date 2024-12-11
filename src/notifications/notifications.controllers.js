//notifications.controller.js
const Notifications = require("../models/notifications.models");
const uuid = require("uuid");
// Configurar la instancia de io

const setIoInstance = (socketIoInstance) => {
    io = socketIoInstance;
};

// notifications.controller.js
const connectedUsers = new Map(); // userId -> Set(socketId)

const setNotificationsUsers = (userId, socketId) => {
    if (!userId || !socketId) {
        console.warn(
            "No se puede establecer el socket: faltan userId o socketId."
        );
        return;
    }

    if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socketId);
    console.log(`Socket del usuario ${userId} añadido: ${socketId}`);
};

const removeNotificationSocket = (userId, socketId) => {
    if (connectedUsers.has(userId)) {
        const sockets = connectedUsers.get(userId);
        sockets.delete(socketId);

        if (sockets.size === 0) {
            connectedUsers.delete(userId); // Elimina el usuario si no quedan sockets
            console.log(
                `Todos los sockets del usuario ${userId} han sido eliminados`
            );
        } else {
            console.log(`Socket ${socketId} eliminado del usuario ${userId}`);
        }
    }
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
        content: notificationData.content,
    });

    const sockets = connectedUsers.get(notificationData.userId);

    if (sockets && sockets.size > 0) {
        sockets.forEach((socketId) => {
            io.to(socketId).emit("new-notification", {
                title: notificationData.title,
                message: notificationData.message,
                type: notificationData.type,
                status: notificationData.status,
                createdAt: notificationData.createdAt || new Date(),
                userId: notificationData.userId,
                content: notificationData.content,
            });
        });
        console.log(
            `Notificación enviada a Usuario ${userId} en los sockets ${[
                ...sockets,
            ]}`
        );
    } else {
        console.log(`Usuario ${userId} no tiene sockets conectados`);
    }

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
    const sockets = connectedUsers.get(userId);

    if (sockets && sockets.size > 0) {
        sockets.forEach((socketId) => {
            io.to(socketId).emit("new-notification", {
                title: data.title,
                message: data.message,
                type: type,
            });
        });
        console.log(
            `Notificación enviada a Usuario ${userId} en los sockets ${[
                ...sockets,
            ]}`
        );
    } else {
        console.log(`Usuario ${userId} no tiene sockets conectados`);
    }
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
    connectedUsers,
    removeNotificationSocket,
};
