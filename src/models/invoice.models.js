const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const Payments = require("./payments.models");

const Invoices = db.define("invoices", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
    },
    paymentId: {
        type: DataTypes.UUID,
        references: {
            model: Payments,
            key: "id",
        },
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
        type: DataTypes.ENUM("issued", "paid", "cancelled"),
        defaultValue: "issued",
    },
    pdfPath: {
        type: DataTypes.STRING, // Ruta donde se almacena la factura en PDF
        allowNull: true,
    },
});

module.exports = Invoices;
