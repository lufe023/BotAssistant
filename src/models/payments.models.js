const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Reservations = require("./reservations.models");

const Payments = db.define("payments", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    reservationId: {
        type: DataTypes.UUID,
        references: {
            model: Reservations,
            key: "id",
        },
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "completed",
    },
});

module.exports = Payments;
