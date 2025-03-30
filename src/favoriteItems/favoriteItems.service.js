const FavoriteItems = require("../models/favorIteItems.models");

const uuid = require("uuid");
const Items = require("../models/items.models");
const Department = require("../models/deparment.models");
const Stock = require("../models/stock.models");
const { Op } = require("sequelize");

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

const getFavoriteItemsByUser = async (userId, departmentId) => {
    // Configuración del include para Stock
    const stockInclude = {
        model: Stock,
        where: { quantity: { [Op.gt]: 0 } },
        include: [{ model: Department, attributes: ["name"] }],
        separate: true,
        order: [["serialNumber", "DESC"]],
    };

    if (departmentId) {
        stockInclude.where.departmentId = departmentId;
    }

    const data = await FavoriteItems.findAll({
        where: { userId },
        include: [{ model: Items, as: "item", include: [stockInclude] }],
    });

    // Procesar los ítems para calcular el stock total
    const processedData = data.map((favItem) => {
        if (!favItem.item) return favItem; // Si el item no existe, lo deja igual

        const totalStock = favItem.item.stocks.reduce(
            (sum, stock) => sum + stock.quantity,
            0
        );

        return {
            ...favItem.toJSON(), // Convertimos a JSON para evitar referencias extrañas
            item: {
                ...favItem.item.toJSON(),
                stock: totalStock, // Agregamos stock total
            },
        };
    });

    return processedData;
};

module.exports = {
    addFavoriteItem,
    removeFavoriteItem,
    getFavoriteItemsByUser,
};
