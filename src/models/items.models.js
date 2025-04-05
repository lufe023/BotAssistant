const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Suppliers = require("./suppliers.models");
const Categories = require("./categories.models");

const Items = db.define("items", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    measurementUnit: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    measurementValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    costPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
    },
    salePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    barcode: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    minStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    expirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isService: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
    },
    infiniteStock: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Categories,
            key: "id",
        },
    },
});

module.exports = Items;
