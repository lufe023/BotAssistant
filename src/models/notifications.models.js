const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const Users = require("./users.models"); // Modelo de usuarios

const Notifications = db.define("notifications", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false, // Usuario al que se le asigna la notificación
        references: {
            model: Users,
            key: "id",
        },
    },
    type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: [
            "new_message", // Notificación de un mensaje nuevo
            "chat_status_change", // Cambio de estado en el chat
            "agent_assigned", // Un agente ha sido asignado
            "voucher_received", // Cliente envió un comprobante de pago
            "user_request_agent", // Usuario solicitó hablar con un agente
            "chat_closed", // El chat se ha cerrado
            "reminder", // Recordatorios (por ejemplo, seguir un pago o responder)
        ],
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true, // Detalle de la notificación
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Si el usuario ya leyó la notificación
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = Notifications;
