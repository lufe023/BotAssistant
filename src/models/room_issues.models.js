const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Rooms = require("./rooms.models");

const RoomIssues = db.define(
    "room_issues",
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
        issueType: {
            type: DataTypes.ENUM(
                "Electrical", // Problemas eléctricos
                "Air Conditioning", // Problemas con el aire acondicionado
                "Hot Water", // Problemas con el agua caliente
                "Leaking", // Filtraciones de agua
                "Bathroom", // Problemas con el baño
                "Other" // Otros problemas generales
            ),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        reportedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        resolvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(
                "Pending", // El problema está pendiente de solución
                "Resolved", // El problema ha sido resuelto
                "In Progress", // El problema está en proceso de solución
                "Closed" // El problema ya no requiere atención
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
                fields: ["issueType"],
            },
            {
                fields: ["reportedAt"],
            },
            {
                fields: ["status"],
            },
        ],
    }
);

module.exports = RoomIssues;
