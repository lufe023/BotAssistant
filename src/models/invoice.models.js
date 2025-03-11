const { DataTypes, Sequelize } = require("sequelize");
const db = require("../utils/database");
const Users = require("./users.models");
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
        type: DataTypes.INTEGER,
        allowNull: true,
        //autoIncrement: true, recordar que al momento de crear la tabla se debe agregar el autoincrement con sql para evitar problemas de sequelize con postgres
        unique: true,
        // defaultValue: Sequelize.literal("nextval('invoice_number_seq')"),
    },

    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Users, // Nombre de la tabla de usuarios
            key: "id",
        },
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
            "refunded",
            "order"
        ),
        defaultValue: "pending",
    },

    pdfPath: {
        type: DataTypes.STRING, // Ruta donde se almacena la factura en PDF
        allowNull: true,
    },
    vendorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Users, // Nombre de la tabla de usuarios
            key: "id",
        },
    },
});

module.exports = Invoices;
