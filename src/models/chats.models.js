const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const Users = require("./users.models"); // Si ya tienes el modelo de usuarios
const Roles = require("./roles.models"); // Si ya tienes el modelo de roles

const Chats = db.define("chats", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Users,
            key: "id",
        },
    },
    agentId: {
        type: DataTypes.UUID,
        allowNull: true, // El agente se asignará más tarde
        references: {
            model: Users,
            key: "id",
        },
    },
    // status: {
    //     type: DataTypes.ENUM,
    //     allowNull: false,
    //     defaultValue: "waiting", // "waiting", "in-progress", "completed"
    // },
    status: {
        type: DataTypes.ENUM(
            "active", // Reservation confirmed and ready to be used, was paid..
            "completed" //Reservation was cancelled by the user or administrator.
        ),
        defaultValue: "active",
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    closedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});

module.exports = Chats;
