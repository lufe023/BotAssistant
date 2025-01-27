const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Galleries = require("./galleries.models");
const Areas = require("./areas.models");

const Rooms = db.define(
    "rooms",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        roomNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        roomType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pricePerNight: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        maxOccupancy: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        bedQuantity: {
            type: DataTypes.INTEGER,
        },
        galleryId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: Galleries,
                key: "id",
            },
        },
        ubication: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: Areas,
                key: "id",
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        // status: {
        //     type: DataTypes.STRING,
        //     defaultValue: "available",
        // },

        // Amenidades
        hotWater: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        wifi: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        airConditioning: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        balcony: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        tv: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        privateBathroom: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        minibar: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        coffeeMaker: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        landscapeView: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        safeBox: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        breakfastIncluded: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        parking: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        poolAccess: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        gymAccess: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        indexes: [
            {
                unique: true,
                fields: ["roomNumber"],
            },
            {
                fields: ["ubication"],
            },
            {
                fields: ["id"],
            },
            {
                fields: ["roomType"],
            },
            {
                fields: ["pricePerNight"],
            },
            {
                fields: ["maxOccupancy"],
            },
        ],
    }
);

module.exports = Rooms;
