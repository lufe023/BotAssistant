const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Users = require("./users.models");
const Departments = require("./deparment.models");
const Items = require("./items.models");
const InventoryHistory = db.define("inventoryHistory", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    itemId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Items,
            key: "id",
        },
    },
    departmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Departments,
            key: "id",
        },
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false }, // Positivo para entrada, negativo para salida
    type: {
        type: DataTypes.ENUM("entrada", "venta", "pérdida", "transferencia"),
        allowNull: false,
    },
    reference: {
        type: DataTypes.STRING,
    }, // ID de factura, venta, orden, etc.
    userId: {
        type: DataTypes.UUID,
        references: {
            model: Users, // Quién hizo la operación
            key: "id",
        },
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT, //sirve para explicar en casi de perdida
        allowNull: true,
    },
});

module.exports = InventoryHistory;
