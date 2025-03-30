// items.service.js
const { Op } = require("sequelize");
const Items = require("../models/items.models");
const Stock = require("../models/stock.models");
const Department = require("../models/deparment.models");

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

const findItemOnTimeService = async (findWord, departmentId) => {
    let looking = findWord.trim().replace(/-/g, "");

    // Construir las condiciones dinámicamente
    let whereConditions = [
        { name: { [Op.iLike]: `%${looking}%` } },
        { description: { [Op.iLike]: `%${looking}%` } },
        { barcode: { [Op.iLike]: `%${looking}%` } },
    ];

    // Configuración del include para Stock
    const stockInclude = {
        model: Stock,
        where: {
            quantity: { [Op.gt]: 0 }, // Filtra los Stock con quantity mayor a 0
        },
        include: [{ model: Department, attributes: ["name"] }],
        separate: true, // Fuerza una subconsulta para el ordenamiento
        order: [
            ["serialNumber", "DESC"], // Ordena los Stock por serialNumber de manera descendente
        ],
    };

    // Si departmentId está presente, agregar el filtro al where de Stock
    if (departmentId) {
        stockInclude.where.departmentId = departmentId;
    }

    const data = await Items.findAndCountAll({
        limit: 6,
        where: {
            [Op.or]: whereConditions,
        },
        include: [stockInclude],
    });

    // Procesar los ítems para calcular el stock total y eliminar la propiedad stock
    data.rows = data.rows.map((item) => {
        // Calcular el stock total sumando las cantidades de todos los stocks
        const totalStock = item.stocks.reduce(
            (sum, stock) => sum + stock.quantity,
            0
        );

        // Eliminar la propiedad stock del objeto principal
        delete item.dataValues.stock;

        // Agregar la propiedad stockTotal con la suma calculada
        item.dataValues.stock = totalStock;

        return item;
    });

    return data;
};

const findItemOnBybarcodeService = async (findWord, departmentId) => {
    let looking = findWord.trim().replace(/-/g, "");

    // Construir las condiciones dinámicamente
    let whereConditions = [{ barcode: { [Op.iLike]: `%${looking}%` } }];

    // Configuración del include para Stock
    const stockInclude = {
        model: Stock,
        where: {
            quantity: { [Op.gt]: 0 }, // Filtra los Stock con quantity mayor a 0
        },
        include: [{ model: Department, attributes: ["name"] }],
        separate: true, // Fuerza una subconsulta para el ordenamiento
        order: [
            ["serialNumber", "DESC"], // Ordena los Stock por serialNumber de manera descendente
        ],
    };

    // Si departmentId está presente, agregar el filtro al where de Stock
    if (departmentId) {
        stockInclude.where.departmentId = departmentId;
    }

    const data = await Items.findAndCountAll({
        limit: 6,
        where: {
            [Op.or]: whereConditions,
        },
        include: [stockInclude],
    });
    // Procesar los ítems para calcular el stock total y eliminar la propiedad stock
    data.rows = data.rows.map((item) => {
        // Calcular el stock total sumando las cantidades de todos los stocks
        const totalStock = item.stocks.reduce(
            (sum, stock) => sum + stock.quantity,
            0
        );

        // Eliminar la propiedad stock del objeto principal
        delete item.dataValues.stock;

        // Agregar la propiedad stockTotal con la suma calculada
        item.dataValues.stock = totalStock;

        return item;
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
