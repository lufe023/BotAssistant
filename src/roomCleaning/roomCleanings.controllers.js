// controllers/roomCleanings.controllers.js

const uuid = require("uuid");
const RoomCleanings = require("../models/RoomCleanings");

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
    return await RoomCleanings.create({
        id: uuid.v4(),
        roomId: cleaningData.roomId,
        cleaningDate: cleaningData.cleaningDate,
        status: cleaningData.status,
        comments: cleaningData.comments,
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
