const db = require("../utils/database");
const { DataTypes } = require("sequelize");

const Galleries = db.define(
    "galleries",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        indexes: [
            {
                fields: ["name"],
            },
        ],
    }
);

module.exports = Galleries;
