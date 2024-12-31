// rooms.controller.js
const Rooms = require("../models/rooms.models");
const Galleries = require("../models/galleries.models");
const uuid = require("uuid");
const Reservations = require("../models/reservations.models");
const GalleryImages = require("../models/galleryImages.models");
const Users = require("../models/users.models");
const RoomIssues = require("../models/room_issues.models");
const ServiceReservations = require("../models/serviceReservations.models");
const Services = require("../models/services.models");
const RoomCleanings = require("../models/roomCleanings");
const { Op } = require("sequelize");
const getAllRooms = async (offset, limit) => {
    const data = await Rooms.findAndCountAll({
        offset: offset,
        limit: limit,
        include: [{ model: Galleries, as: "gallery" }],
    });
    return data;
};

const getRoomById = async (id) => {
    //estas variables son importantes para determinar las fechas 15 dias antes y 15 dias despues
    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 15);
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 15);

    const room = await Rooms.findByPk(id, {
        include: [
            {
                model: Galleries,
                as: "gallery",
                include: [{ model: GalleryImages }],
            },
            {
                model: Reservations,
                required: false,
                //Este where es para limitar la consulta de reservaciones a las que esten entre 15 dias antes y 15 dias despues pero sin importar la fecha siempre incluirá las reservaciones pendientes.
                where: {
                    [Op.or]: [
                        {
                            checkIn: {
                                [Op.between]: [pastDate, futureDate],
                            },
                        },
                        {
                            checkOut: {
                                [Op.between]: [pastDate, futureDate],
                            },
                        },
                        {
                            status: "Pending",
                        },
                    ],
                },
                include: [
                    {
                        model: Users,
                        attributes: [
                            "firstName",
                            "lastName",
                            "email",
                            "phone",
                            "picture",
                        ],
                    },
                ],
            },
            {
                model: RoomCleanings,
                required: false,
                where: {
                    status: "Pending",
                },
                include: [
                    {
                        model: Users,
                        as: "cleanedBy",
                        attributes: ["firstName", "lastName", "picture"],
                    },
                ],
            },
            {
                model: RoomIssues,
                required: false, // Incluye habitaciones sin reservasx
                where: {
                    [Op.or]: [{ status: "In Progress" }, { status: "Pending" }],
                },
            },
        ],
    });

    if (room.room_cleanings && room.room_cleanings.length > 0) {
        room.setDataValue("status", "cleaning");
    } else if (room.room_issues && room.room_issues.length > 0) {
        room.setDataValue("status", "repairing");
    } else if (room.reservations && room.reservations.length > 0) {
        const now = new Date();

        // Iteramos sobre todas las reservaciones
        const isOccupied = room.reservations.some((reservation) => {
            const checkInDate = new Date(reservation.checkIn);
            const checkOutDate = new Date(reservation.checkOut);

            // Verificamos si la fecha actual está entre checkIn y checkOut
            return (
                checkInDate <= now &&
                checkOutDate >= now &&
                reservation.status === "Approved"
            );
        });

        if (isOccupied) {
            // Si está ocupada, establecemos el estado en "occupied"
            room.setDataValue("status", "occupied");
        } else {
            const hasPendingReservation = room.reservations.some(
                (reservation) => {
                    const checkInDate = new Date(reservation.checkIn);
                    const checkOutDate = new Date(reservation.checkOut);

                    // Verificamos si la fecha actual está entre checkIn y checkOut
                    return (
                        checkInDate <= now &&
                        checkOutDate >= now &&
                        reservation.status === "Pending"
                    );
                }
            );

            if (hasPendingReservation) {
                room.setDataValue("status", "pendingReservation"); // Reservada para el futuro
            } else {
                room.setDataValue("status", "available"); // No tiene reservas
            }
        }
    } else {
        // Si no hay reservaciones, la habitación está disponible
        room.setDataValue("status", "available");
    }

    return room;
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

const getRoomHistory = async (roomId) => {
    try {
        // Validar el ID de la habitación
        if (!roomId) {
            throw new Error("El ID de la habitación es obligatorio.");
        }

        // Obtener la habitación
        const room = await Rooms.findByPk(roomId);
        if (!room) {
            throw new Error("La habitación no existe.");
        }

        // Obtener todas las reservas de la habitación
        const reservations = await Reservations.findAll({
            where: { roomId },
            include: [
                {
                    model: ServiceReservations, // Incluir las reservas de servicios
                    include: [
                        {
                            model: Services, // Incluir los servicios relacionados
                        },
                    ],
                    order: [["dispatchedAt", "ASC"]], // Ordenar por la fecha de despacho
                },
            ],
            order: [["checkIn", "ASC"]], // Ordenar las reservas por la fecha de entrada
        });

        // Obtener todos los problemas reportados para la habitación
        const issues = await RoomIssues.findAll({
            where: { roomId },
            order: [["reportedAt", "ASC"]], // Ordenar por la fecha de reporte
        });

        // Obtener todas las limpiezas hechas a la habitación
        const cleanings = await RoomCleanings.findAll({
            where: { roomId },
            order: [["cleaningDate", "ASC"]], // Ordenar por la fecha de reporte
            include: [
                {
                    model: Users,
                    as: "cleanedBy",
                    attributes: ["firstName", "lastName", "picture"],
                },
            ],
        });

        // Crear un array para almacenar todos los eventos (reservas, problemas)
        let history = [];

        // Agregar las reservas al historial
        reservations.forEach((reservation) => {
            history.push({
                type: "Reservation",
                date: new Date(reservation.checkIn).toLocaleDateString("es-ES"),
                description: `Reserva confirmada desde ${new Date(
                    reservation.checkIn
                ).toLocaleDateString("es-ES")} hasta ${new Date(
                    reservation.checkOut
                ).toLocaleDateString("es-ES")}. Precio total: $${
                    reservation.totalPrice
                }`,
                status: reservation.status,
                data: reservation,
            });

            // Agregar los servicios reservados a la historia
            reservation.ServiceReservations?.forEach((serviceReservation) => {
                history.push({
                    type: "ServiceReservation",
                    date: new Date(
                        serviceReservation.dispatchedAt
                    ).toLocaleDateString("es-ES"),
                    description: `Servicio '${
                        serviceReservation.Service.name
                    }' despachado el ${new Date(
                        serviceReservation.dispatchedAt
                    ).toLocaleDateString("es-ES")}. Precio: $${
                        serviceReservation.totalPrice
                    }`,
                    status: serviceReservation.status || "Dispatched", // Asegurarse de que el estado del servicio esté disponible
                    data: serviceReservation,
                });
            });
        });

        // Agregar los problemas reportados a la historia
        issues.forEach((issue) => {
            history.push({
                type: "Issue",
                date: new Date(issue.reportedAt).toLocaleDateString("es-ES"),
                description: `${issue.issueType}: ${issue.description}. ${
                    issue.resolvedAt
                        ? `Resuelto el ${new Date(
                              issue.resolvedAt
                          ).toLocaleDateString("es-ES")}`
                        : "Pendiente de resolución"
                }`,
                status: issue.status,
                data: issue,
            });
        });

        // Agregar las limpiezas reportadas a la historia
        cleanings.forEach((cleaning) => {
            history.push({
                type: "Cleaning",
                date: new Date(cleaning.cleaningDate).toLocaleDateString(
                    "es-ES"
                ),
                description: `${cleaning.cleaningType}: ${cleaning.notes}.
                solicitado el ${new Date(cleaning.createdAt).toLocaleDateString(
                    "es-ES"
                )}.
                y programado para el ${new Date(
                    cleaning.cleaningDate
                ).toLocaleDateString("es-ES")}.
                asignado a ${cleaning.cleanedBy.firstName}
                `,
                status: cleaning.status,
                data: cleaning,
            });
        });

        // Ordenar todos los eventos por fecha (ya sea de reserva, servicio o problema)
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Asegurarse de que history siempre sea un array, aunque no haya datos
        return history.length ? history : [];
    } catch (error) {
        console.error(
            "Error al obtener el historial de la habitación:",
            error.message
        );
        throw error; // Devolver el error para manejo posterior
    }
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    getRoomHistory,
};
