const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const Invoice = require("./invoice.models");

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
});

module.exports = InvoiceDetail;
