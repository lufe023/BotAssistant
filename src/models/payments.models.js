const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const Reservations = require("./reservations.models");

const Payments = db.define("payments", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
    },
    reservationId: {
        type: DataTypes.UUID,
        references: {
            model: Reservations,
            key: "id",
        },
        allowNull: true, // Puede ser null si el pago no está relacionado con una reservación
    },
    type: {
        type: DataTypes.ENUM("reservation", "product", "service"), // Tipo de pago
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    paymentMethod: {
        type: DataTypes.ENUM(
            "credit_card",
            "debit_card",
            "cash",
            "bank_transfer",
            "paypal"
        ),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
        defaultValue: "pending",
    },
    notes: {
        type: DataTypes.TEXT, // Para registrar detalles adicionales sobre el pago
        allowNull: true,
    },
});

module.exports = Payments;
