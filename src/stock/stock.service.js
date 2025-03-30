const Stock = require("../models/stock.models");

const getAllStock = async () => await Stock.findAll();

const getStockById = async (id) => await Stock.findByPk(id);

const createStock = async (data) => {
    if (!data.serialNumber) {
        data.serialNumber = generateSerialNumber(); // Función para generar un serial único
    }

    if (!data.batchNumber) {
        data.batchNumber = `BATCH-${Date.now()}`;
    }

    return await Stock.create(data);
};

// Función para generar un serial único basado en la fecha y un número aleatorio
const generateSerialNumber = () => {
    return `SN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

const updateStock = async (id, data) => {
    const stock = await Stock.findByPk(id);
    if (!stock) return null;
    await stock.update(data);
    return stock;
};

const removeStock = async (id) => {
    const stock = await Stock.findByPk(id);
    if (!stock) return null;
    await stock.destroy();
    return true;
};

module.exports = {
    getAllStock,
    getStockById,
    createStock,
    updateStock,
    removeStock,
};
