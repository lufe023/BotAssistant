const Areas = require("../models/areas.models");
const uuid = require("uuid");

// Obtener todas las áreas
const getAllAreasController = async () => {
    const areas = await Areas.findAndCountAll({
        order: [["name", "ASC"]], // Ordenar por el campo 'name' en orden ascendente (A-Z)
    });
    return areas;
};

// Obtener un área por su ID
const getAreaByIdController = async (id) => {
    const area = await Areas.findOne({
        where: {
            id,
        },
    });
    return area;
};

// Crear una nueva área
const createNewAreaController = async (data) => {
    const newArea = await Areas.create({
        id: uuid.v4(),
        name: data.name,
        description: data.description || null,
    });
    return newArea;
};

// Actualizar un área por su ID
const updateAreaController = async (id, data) => {
    const updatedArea = await Areas.update(
        {
            name: data.name,
            description: data.description || null,
        },
        {
            where: {
                id,
            },
            returning: true, // Devuelve el área actualizada
        }
    );

    return updatedArea[1][0]; // El área actualizada
};

// Eliminar un área por su ID
const deleteAreaController = async (id) => {
    const deleted = await Areas.destroy({
        where: {
            id,
        },
    });

    return deleted; // Devuelve el número de filas eliminadas (0 o 1)
};

module.exports = {
    getAllAreasController,
    getAreaByIdController,
    createNewAreaController,
    updateAreaController,
    deleteAreaController,
};
