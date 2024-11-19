const { Model } = require("sequelize");
const Galleries = require("../models/galleries.models");
const uuid = require("uuid");
const GalleryImages = require("../models/galleryImages.models");

const getAllGalleries = async (offset, limit) => {
    return await Galleries.findAndCountAll({
        offset,
        limit,
        include: [{ model: GalleryImages }],
    });
};

const getGalleryById = async (id) => {
    return await Galleries.findByPk(id);
};

const createGallery = async (galleryData) => {
    return await Galleries.create({
        id: uuid.v4(),
        name: galleryData.name,
        details: galleryData.details,
    });
};

const updateGallery = async (id, galleryData) => {
    const [updated] = await Galleries.update(galleryData, { where: { id } });
    return updated ? await Galleries.findByPk(id) : null;
};

const deleteGallery = async (id) => {
    return await Galleries.destroy({ where: { id } });
};

module.exports = {
    getAllGalleries,
    getGalleryById,
    createGallery,
    updateGallery,
    deleteGallery,
};
