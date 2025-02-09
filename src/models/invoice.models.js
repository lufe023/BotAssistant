const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const Invoices = db.define("invoices", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
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
    invoiceNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    issueDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(
            "pending",
            "paid",
            "cancelled",
            "failed",
            "refunded"
        ),
        defaultValue: "pending",
    },
    pdfPath: {
        type: DataTypes.STRING, // Ruta donde se almacena la factura en PDF
        allowNull: true,
    },
});

module.exports = Invoices;
