const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Roles = require("../models/roles.models");

const Users = db.define(
    "users",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        birthday: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Roles,
                key: "id",
            },
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true, // Campo específico para clientes, si necesario
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "active",
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: "is_verified",
            defaultValue: false,
        },
        isBotTalking: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        indexes: [
            {
                fields: ["id"],
            },
            {
                fields: ["firstName"],
            },
            {
                fields: ["lastName"],
            },
            {
                unique: true,
                fields: ["email"],
            },
            {
                fields: ["role"],
            },
            {
                fields: ["status"],
            },
        ],
    }
);

module.exports = Users;
