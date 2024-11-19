const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Galleries = require("./galleries.models");

const Rooms = db.define("rooms", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    roomNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    roomType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pricePerNight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    maxOccupancy: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bedQuantity: {
        type: DataTypes.INTEGER,
    },
    galleryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Galleries,
            key: "id",
        },
    },
    ubication: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "available",
    },
});

module.exports = Rooms;
