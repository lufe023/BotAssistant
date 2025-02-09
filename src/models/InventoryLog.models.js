const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Items = require("./items.models");
const InventoryLog = db.define("inventory_logs", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
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
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    transactionType: {
        type: DataTypes.ENUM("entry", "exit", "adjustment"),
        allowNull: false,
    },
    transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    costPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    salePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = InventoryLog;
