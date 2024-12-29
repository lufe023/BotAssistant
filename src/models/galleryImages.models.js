const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Galleries = require("./galleries.models");

const GalleryImages = db.define(
    "gallery_images",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        galleryId: {
            type: DataTypes.UUID,
            references: {
                model: Galleries,
                key: "id",
            },
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        altText: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        indexes: [
            {
                fields: ["galleryId"],
            },
            {
                fields: ["imageUrl"],
            },
        ],
    }
);

module.exports = GalleryImages;
