const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Users = require("./users.models");
const Rooms = require("./rooms.models");

const Reservations = db.define(
    "reservations",
    {
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
        checkIn: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        checkOut: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(
                "Pending", //Reservation registered but not yet confirmed
                "Approved", // Reservation confirmed and ready to be used, was paid.
                "Rejected", //Reservation was not accepted due to unavailability or other reasons.
                "Cancelled", //Reservation was cancelled by the user or administrator.
                "Completed", //Reservation has been used (e.g., after the client has checked out).
                "No show", //The client did not show up to use the reservation. but the client Paids
                "Expired" //Reservation was not used within the assigned time.
            ),
            defaultValue: "Pending",
        },
        totalPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        voucher: {
            type: DataTypes.STRING,
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
                fields: ["checkIn"],
            },
            {
                fields: ["checkOut"],
            },
            {
                fields: ["status"],
            },
        ],
    }
);

module.exports = Reservations;
