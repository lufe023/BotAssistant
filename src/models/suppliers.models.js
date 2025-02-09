const db = require("../utils/database");
const { DataTypes } = require("sequelize");

const Suppliers = db.define("suppliers", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contactName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contactPhone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    company: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
    },
});

module.exports = Suppliers;
