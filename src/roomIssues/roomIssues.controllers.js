const { v4: uuidv4 } = require("uuid");
const RoomIssues = require("../models/room_issues.models");
const Rooms = require("../models/rooms.models");

const getAllRoomIssues = async () => {
    return await RoomIssues.findAll({
        include: {
            model: Rooms,
            attributes: ["id", "name"], // Ajusta según los atributos de la tabla Rooms
        },
    });
};

const getRoomIssueById = async (id) => {
    return await RoomIssues.findOne({
        where: { id },
        include: {
            model: Rooms,
            attributes: ["id", "name"], // Ajusta según los atributos de la tabla Rooms
        },
    });
};

const createRoomIssue = async (data) => {
    const newIssue = {
        id: uuidv4(),
        roomId: data.roomId,
        issueType: data.issueType,
        description: data.description,
        reportedAt: data.reportedAt || new Date(),
        resolvedAt: data.resolvedAt || null,
        status: data.status || "Pending",
    };
    return await RoomIssues.create(newIssue);
};

const updateRoomIssue = async (id, data) => {
    const issue = await RoomIssues.findByPk(id);
    if (!issue) return null;

    await issue.update(data);
    return issue;
};

const deleteRoomIssue = async (id) => {
    const issue = await RoomIssues.findByPk(id);
    if (!issue) return null;

    await issue.destroy();
    return issue;
};

module.exports = {
    getAllRoomIssues,
    getRoomIssueById,
    createRoomIssue,
    updateRoomIssue,
    deleteRoomIssue,
};
