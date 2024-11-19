// rooms.controller.js
const Rooms = require("../models/rooms.models");
const Galleries = require("../models/galleries.models");
const uuid = require("uuid");
const Reservations = require("../models/reservations.models");
const getAllRooms = async (offset, limit) => {
    const data = await Rooms.findAndCountAll({
        offset: offset,
        limit: limit,
        include: [{ model: Galleries, as: "gallery" }],
    });
    return data;
};

const getRoomById = async (id) => {
    return await Rooms.findByPk(id, {
        include: [{ model: Galleries, as: "gallery" }, { model: Reservations }],
    });
};

const createRoom = async (roomData) => {
    return await Rooms.create({
        id: uuid.v4(),
        roomNumber: roomData.roomNumber,
        roomType: roomData.roomType,
        pricePerNight: roomData.pricePerNight,
        maxOccupancy: roomData.maxOccupancy,
        galleryId: roomData.galleryId,
        description: roomData.description,
        status: roomData.status,
    });
};

const updateRoom = async (id, roomData) => {
    const [updated] = await Rooms.update(roomData, {
        where: { id },
    });
    return updated ? await Rooms.findByPk(id) : null;
};

const deleteRoom = async (id) => {
    return await Rooms.destroy({
        where: { id },
    });
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
};
