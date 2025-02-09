const db = require("../utils/database");
const { DataTypes } = require("sequelize");

const Categories = db.define("categories", {
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
    parentCategoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "categories",
            key: "id",
        },
    },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
    },
});

module.exports = Categories;
