const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Suppliers = require("./suppliers.models");
const Items = require("./items.models");
const Department = require("./deparment.models");

const Stock = db.define("stock", {
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
            model: Department,
            key: "id",
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    supplierId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Suppliers,
            key: "id",
        },
    },
});

module.exports = Stock;
