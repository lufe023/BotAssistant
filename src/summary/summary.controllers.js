const { Op, Sequelize } = require("sequelize"); // Para operaciones avanzadas en fechas
const Rooms = require("../models/rooms.models");
const Galleries = require("../models/galleries.models");
const Reservations = require("../models/reservations.models");

const getAllRooms = async (offset, limit) => {
    const today = new Date();

    const data = await Rooms.findAndCountAll({
        offset: offset,
        limit: limit,
        include: [
            {
                model: Galleries,
                as: "gallery",
            },
            {
                model: Reservations,
                as: "Reservations",
                where: {
                    [Op.or]: [
                        {
                            checkInDate: { [Op.lte]: today },
                            checkOutDate: { [Op.gte]: today },
                        }, // Habitaciones ocupadas hoy
                        { status: "cleaning" }, // Habitaciones en limpieza
                    ],
                },
                required: false, // Permite habitaciones sin reservas activas
            },
        ],
    });

    return data;
};

const getRoomStatusSummary = async (ubication) => {
    const today = new Date();

    // Solo aplica la condición de ubicación si se proporciona un valor válido
    const roomConditions = ubication ? { ubication } : {};

    // Contar habitaciones ocupadas hoy en la ubicación especificada (o en todas si `ubication` es falsy)
    const pendingReservations = await Reservations.count({
        where: {
            // checkInDate: { [Op.lte]: today },
            // checkOutDate: { [Op.gte]: today },
            status: "pending",
        },
        include: [
            {
                model: Rooms,
                where: roomConditions, // Condición de ubicación si existe, o ninguna si es falsy
            },
        ],
    });

    // Llamar todas las habitaciones
    const allRooms = await Rooms.findAll({
        where: {
            ...roomConditions,
        },
        order: [["roomNumber", "ASC"]],
    });

    // Contar habitaciones en limpieza en la ubicación especificada (o en todas)
    const roomsCleaningToday = await Rooms.count({
        where: {
            ...roomConditions,
            status: "cleaning",
        },
    });

    // Contar habitaciones disponibles en la ubicación especificada (o en todas)
    const roomsAvailable = await Rooms.count({
        where: {
            ...roomConditions,
            status: "available",
        },
    });

    // Contar habitaciones reparando en la ubicación especificada (o en todas)
    const roomsRepairing = await Rooms.count({
        where: {
            ...roomConditions,
            status: "repairing",
        },
    });

    // Contar habitaciones ocupadas en la ubicación especificada (o en todas)
    const roomsOccupiedToday = await Rooms.count({
        where: {
            ...roomConditions,
            status: "occupied",
        },
    });

    // Obtener todas las ubicaciones únicas y ordenarlas alfabéticamente
    const allUbications = await Rooms.findAll({
        attributes: [
            [Sequelize.fn("DISTINCT", Sequelize.col("ubication")), "ubication"],
        ],
        order: [[Sequelize.col("ubication"), "ASC"]], // Ordenar las ubicaciones alfabéticamente
    }).then((locations) => locations.map((loc) => loc.ubication));

    return {
        occupied: roomsOccupiedToday,
        cleaning: roomsCleaningToday,
        available: roomsAvailable,
        repairing: roomsRepairing,
        pendingReservations,
        allRooms,
        allUbications, // Agregamos el dato de todas las ubicaciones
    };
};

module.exports = {
    getAllRooms,
    getRoomStatusSummary,
};
