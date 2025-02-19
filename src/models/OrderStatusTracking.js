const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const InvoiceDetail = require("./invoiceDetail.models");

const OrderStatusTracking = db.define("order_status_tracking", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
    },
    invoiceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: InvoiceDetail,
            key: "id",
        },
    },
    status: {
        type: DataTypes.ENUM(
            "pending",
            "sent_to_kitchen",
            "accepted_by_kitchen",
            "preparing",
            "ready_to_serve",
            "picked_up",
            "on_the_way",
            "delivered",
            "completed",
            "returned",
            "cancelled"
        ),
        allowNull: false,
    },
    updatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Usuario o sistema que actualizó el estado",
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Comentarios adicionales sobre el cambio de estado",
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = OrderStatusTracking;
