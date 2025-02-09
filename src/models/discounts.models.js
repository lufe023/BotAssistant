const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Items = require("./items.models");

const Discounts = db.define("discounts", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    discountType: {
        type: DataTypes.ENUM("percentage", "fixed"),
        allowNull: false,
    },
    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
    },
    itemId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Items,
            key: "id",
        },
    },
});

module.exports = Discounts;
