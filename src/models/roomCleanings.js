const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Rooms = require("./rooms.models");
const Users = require("./users.models"); // Para registrar el usuario responsable

const RoomCleanings = db.define(
    "room_cleanings",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        roomId: {
            type: DataTypes.UUID,
            references: {
                model: Rooms, // Referencia a la tabla de Rooms
                key: "id",
            },
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            references: {
                model: Users, // Usuario que realiza la limpieza
                key: "id",
            },
            allowNull: false,
        },
        cleaningType: {
            type: DataTypes.ENUM(
                "Routine", // Limpieza rutinaria
                "Deep Cleaning", // Limpieza profunda
                "Emergency Cleaning" // Limpieza por emergencia
            ),
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true, // Notas opcionales sobre la limpieza
        },
        cleaningDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false, // Fecha y hora de la limpieza
        },
        status: {
            type: DataTypes.ENUM(
                "Pending", // Limpieza programada pero no realizada aún
                "Completed", // Limpieza realizada
                "Canceled" // Limpieza cancelada
            ),
            defaultValue: "Pending",
        },
    },
    {
        indexes: [
            {
                fields: ["roomId"],
            },
            {
                fields: ["userId"],
            },
            {
                fields: ["cleaningType"],
            },
            {
                fields: ["cleaningDate"],
            },
            {
                fields: ["status"],
            },
        ],
    }
);

module.exports = RoomCleanings;
