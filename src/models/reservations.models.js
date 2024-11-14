const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Users = require("./users.models");
const Rooms = require("./rooms.models");

const Reservations = db.define("reservations", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: Users,
            key: "id",
        },
    },
    roomId: {
        type: DataTypes.UUID,
        references: {
            model: Rooms,
            key: "id",
        },
    },
    checkInDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    checkOutDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
});

module.exports = Reservations;
