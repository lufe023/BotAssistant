const { Op, Sequelize } = require("sequelize"); // Para operaciones avanzadas en fechas
const Rooms = require("../models/rooms.models");
const Galleries = require("../models/galleries.models");
const Reservations = require("../models/reservations.models");
const RoomCleanings = require("../models/roomCleanings");
const RoomIssues = require("../models/room_issues.models");
const Configurations = require("../models/configurations.models");
const Areas = require("../models/areas.models");

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
    try {
        // Obtener configuraciones predeterminadas de check-in y check-out
        const config = await Configurations.findOne();
        if (!config) {
            throw new Error(
                "No se encontraron configuraciones predeterminadas."
            );
        }

        const now = new Date();

        // Condición para filtrar por ubicación
        const roomConditions = ubication ? { ubication } : {};

        // Obtener todas las habitaciones con sus relaciones
        const rooms = await Rooms.findAll({
            where: roomConditions,
            include: [
                {
                    model: Reservations,
                    required: false,
                },
                {
                    model: RoomCleanings,
                    required: false,
                    where: [{ status: "Pending" }],
                },
                {
                    model: RoomIssues,
                    required: false,
                    where: {
                        [Op.or]: [
                            { status: "In Progress" },
                            { status: "Pending" },
                        ],
                    },
                },
            ],
            order: [["roomNumber", "ASC"]],
        });

        // Resumen inicial
        const statusSummary = {
            occupied: 0,
            cleaning: 0,
            available: 0,
            repairing: 0,
            pendingReservations: 0,
        };

        // Recorrer las habitaciones y determinar su estado
        const roomDetails = rooms.map((room) => {
            let status = "available"; // Estado predeterminado

            if (room.room_cleanings && room.room_cleanings.length > 0) {
                status = "cleaning";
            } else if (room.room_issues && room.room_issues.length > 0) {
                status = "repairing";
            } else if (room.reservations && room.reservations.length > 0) {
                const isOccupied = room.reservations.some((reservation) => {
                    const checkInDate = new Date(reservation.checkIn);
                    const checkOutDate = new Date(reservation.checkOut);
                    return (
                        checkInDate <= now &&
                        checkOutDate >= now &&
                        reservation.status === "Approved"
                    );
                });

                if (isOccupied) {
                    status = "occupied";
                } else {
                    const hasPendingReservation = room.reservations.some(
                        (reservation) => {
                            const checkInDate = new Date(reservation.checkIn);
                            return (
                                checkInDate > now &&
                                reservation.status === "Pending"
                            );
                        }
                    );

                    if (hasPendingReservation) {
                        status = "pendingReservations";
                    }
                }
            }

            // Contar habitaciones según el estado
            statusSummary[status]++;

            return {
                id: room.id,
                roomNumber: room.roomNumber,
                roomType: room.roomType,
                status,
                bedQuantity: room.bedQuantity,
                maxOccupancy: room.maxOccupancy,
            };
        });

        // Obtener todas las ubicaciones únicas y ordenarlas alfabéticamente
        const allUbications = await Areas.findAll({ order: [["name", "ASC"]] });

        // Retornar el resumen y los detalles de cada habitación
        return {
            summary: statusSummary,
            rooms: roomDetails,
            allUbications,
        };
    } catch (error) {
        console.error("Error en getRoomStatusSummary:", error.message);
        throw new Error(
            "Error al obtener el resumen del estado de las habitaciones."
        );
    }
};

module.exports = {
    getAllRooms,
    getRoomStatusSummary,
};
