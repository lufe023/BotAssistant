// items.service.js
const { Op } = require("sequelize");
const Items = require("../models/items.models");

const getAll = async () => {
    return await Items.findAll();
};

const getById = async (id) => {
    return await Items.findByPk(id);
};

const createItem = async (data) => {
    return await Items.create(data);
};

const update = async (id, data) => {
    const item = await Items.findByPk(id);
    if (!item) return null;
    await item.update(data);
    return item;
};

const remove = async (id) => {
    const item = await Items.findByPk(id);
    if (!item) return null;
    await item.destroy();
    return true;
};

const findItemOnTimeService = async (findWord) => {
    let looking = findWord.trim().replace(/-/g, "");

    // Construir las condiciones dinámicamente
    //se busca por name, description, barcode,
    let whereConditions = [
        { name: { [Op.iLike]: `%${looking}%` } },
        { description: { [Op.iLike]: `%${looking}%` } },
        { barcode: { [Op.iLike]: `%${looking}%` } },
    ];

    const data = await Items.findAndCountAll({
        limit: 6,
        where: {
            [Op.or]: whereConditions,
        },
    });
    console.log("BUscando looking: " + looking + "Y word: " + findWord);
    return data;
};

const findItemOnBybarcodeService = async (findWord) => {
    let looking = findWord.trim().replace(/-/g, "");

    const data = await Items.findAndCountAll({
        limit: 1,
        where: { barcode: looking },
    });

    return data;
};
module.exports = {
    getAll,
    getById,
    createItem,
    update,
    remove,
    findItemOnTimeService,
    findItemOnBybarcodeService,
};
