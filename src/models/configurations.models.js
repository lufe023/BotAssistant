// models/configurations.models.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Configurations = sequelize.define("configurations", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    defaultCheckInTime: {
        type: DataTypes.STRING, // Por ejemplo, "14:00:00"
        allowNull: false,
        defaultValue: "14:00:00",
    },
    defaultCheckOutTime: {
        type: DataTypes.STRING, // Por ejemplo, "12:00:00"
        allowNull: false,
        defaultValue: "12:00:00",
    },
});

module.exports = Configurations;
