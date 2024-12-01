const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const Chats = require("./chats.models"); // Relación con el chat
const Users = require("./users.models");

const Messages = db.define("messages", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    chatId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Chats,
            key: "id",
        },
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Users,
            key: "id",
        },
    },
    senderRole: {
        type: DataTypes.STRING,
        allowNull: true, // 'user' o 'agent'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    sentAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = Messages;
