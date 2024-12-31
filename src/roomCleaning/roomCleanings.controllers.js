// controllers/roomCleanings.controllers.js

const uuid = require("uuid");
const RoomCleanings = require("../models/roomCleanings");

const getAllCleanings = async (offset, limit) => {
    return await RoomCleanings.findAndCountAll({
        offset,
        limit,
        include: [{ model: require("../models/rooms.models"), as: "room" }],
    });
};

const getCleaningById = async (id) => {
    return await RoomCleanings.findByPk(id);
};

const createCleaning = async (cleaningData) => {
    console.log("Lo que esta llegando aqui " + JSON.stringify(cleaningData));
    return await RoomCleanings.create({
        id: uuid.v4(),
        roomId: cleaningData.roomId,
        userId: cleaningData.userId,
        cleaningType: cleaningData.cleaningType,
        notes: cleaningData.notes,
        cleaningDate: cleaningData.cleaningDate,
        status: cleaningData.status,
    });
};

const updateCleaning = async (id, cleaningData) => {
    const [updated] = await RoomCleanings.update(cleaningData, {
        where: { id },
    });
    return updated;
};

const deleteCleaning = async (id) => {
    return await RoomCleanings.destroy({ where: { id } });
};

module.exports = {
    getAllCleanings,
    getCleaningById,
    createCleaning,
    updateCleaning,
    deleteCleaning,
};
