const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const Invoice = require("./invoice.models");
const Items = require("./items.models");
const InvoiceDetail = db.define("invoice_details", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    invoiceId: {
        type: DataTypes.UUID,
        references: {
            model: Invoice,
            key: "id",
        },
        allowNull: false,
    },
    itemId: {
        type: DataTypes.UUID,
        references: {
            model: Items,
            key: "id",
        },
        allowNull: false,
    },

    itemName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    itemDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
    },
    orderType: {
        type: DataTypes.ENUM("product", "service"),
        allowNull: false,
    },
    assignedSpot: {
        type: DataTypes.STRING,
        allowNull: true,
        comment:
            "Ubicación del servicio o consumo (mesa, habitación, área específica, etc.)",
    },
    status: {
        type: DataTypes.ENUM("pending", "in_progress", "served", "cancelled"),
        defaultValue: "pending",
    },
});

module.exports = InvoiceDetail;
