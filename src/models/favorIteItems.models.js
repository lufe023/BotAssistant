const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Items = require("./items.models");
const Users = require("./users.models");

const favoriteItems = db.define("favorite_Items", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    itemId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Items,
            key: "id",
        },
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Users,
            key: "id",
        },
    },
});

module.exports = favoriteItems;
