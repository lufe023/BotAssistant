const db = require("../utils/database");
const { DataTypes } = require("sequelize");

const Areas = db.define("areas", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    area_type: {
        field: "area_type",
        type: DataTypes.ENUM(
            "rooms",
            "social",
            "restaurant",
            "bar",
            "pool",
            "gym",
            "other"
        ),
        defaultValue: "other",
        allowNull: true,
    },
});

module.exports = Areas;
