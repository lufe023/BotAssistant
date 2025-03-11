const FavoriteItems = require("../models/favorIteItems.models");

const uuid = require("uuid");
const Items = require("../models/items.models");

const addFavoriteItem = async (userId, itemId) => {
    const existeFavorito = await FavoriteItems.findOne({
        where: { userId, itemId },
    });
    if (existeFavorito) {
        throw { status: 200, message: "El item ya está en favoritos" };
    }

    const nuevoFavorito = await FavoriteItems.create({
        id: uuid.v4(),
        userId,
        itemId,
    });
    return nuevoFavorito;
};

const removeFavoriteItem = async (userId, itemId) => {
    const favorite = await FavoriteItems.findOne({
        where: { userId, itemId },
    });
    if (!favorite) return null;
    await favorite.destroy();
    return true;
};

const getFavoriteItemsByUser = async (userId) => {
    return await FavoriteItems.findAll({
        where: { userId },
        include: [{ model: Items, as: "item" }], // Asumiendo que tienes una relación definida en el modelo
    });
};

module.exports = {
    addFavoriteItem,
    removeFavoriteItem,
    getFavoriteItemsByUser,
};
