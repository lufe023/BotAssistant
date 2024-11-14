// controllers/reservations.controllers.js
const Reservations = require("../models/reservations.models");
const uuid = require("uuid");
const Rooms = require("../models/rooms.models");
const { Op } = require("sequelize");

const getAllReservations = async (offset, limit) => {
    return await Reservations.findAndCountAll({
        offset,
        limit,
    });
};

const getReservationById = async (id) => {
    return await Reservations.findByPk(id);
};

const createReservation = async (reservationData) => {
    const { roomId, checkInDate, checkOutDate } = reservationData;

    // Verificar disponibilidad y calcular precio
    const { isAvailable, totalPrice } = await calculateAvailabilityAndCost(
        roomId,
        checkInDate,
        checkOutDate
    );

    if (!isAvailable) {
        throw new Error(
            "La habitación no está disponible en el rango de fechas seleccionado"
        );
    }

    // Crear la reservación si está disponible
    return await Reservations.create({
        id: uuid.v4(),
        ...reservationData,
        totalPrice,
    });
};

const updateReservation = async (id, reservationData) => {
    const [updated] = await Reservations.update(reservationData, {
        where: { id },
    });
    return updated ? await Reservations.findByPk(id) : null;
};

const deleteReservation = async (id) => {
    return await Reservations.destroy({
        where: { id },
    });
};

const getReservationsByDateRange = async (startDate, endDate) => {
    try {
        const reservations = await Reservations.findAndCountAll({
            where: {
                checkInDate: {
                    [Op.gte]: startDate,
                },
                checkOutDate: {
                    [Op.lte]: endDate,
                },
            },
        });
        return reservations;
    } catch (error) {
        throw new Error("Error retrieving reservations by date range");
    }
};

//obtener todas las fechas reservadas en un rango
const calculateAvailabilityAndCost = async (
    roomId,
    checkInDate,
    checkOutDate
) => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    // Validación de fechas
    if (start >= end) {
        throw new Error(
            "La fecha de check-out debe ser posterior a la de check-in"
        );
    }

    // Verificar disponibilidad de la habitación
    const overlappingReservations = await Reservations.findOne({
        where: {
            roomId,
            checkInDate: { $lt: end },
            checkOutDate: { $gt: start },
        },
    });

    // Retornar no disponible si hay una reserva superpuesta
    if (overlappingReservations) {
        return { isAvailable: false, totalPrice: 0 };
    }

    // Calcular precio total basado en la tarifa por noche
    const room = await Rooms.findByPk(roomId);
    if (!room) {
        throw new Error("Habitación no encontrada");
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = room.pricePerNight * nights;

    return { isAvailable: true, totalPrice };
};

//obtener todas las fechas disponibles en un rango
const getAvailableDates = async (startDate, endDate) => {
    try {
        const reservations = await Reservations.findAll({
            where: {
                [Op.or]: [
                    {
                        checkInDate: {
                            [Op.between]: [startDate, endDate],
                        },
                    },
                    {
                        checkOutDate: {
                            [Op.between]: [startDate, endDate],
                        },
                    },
                ],
            },
            include: [
                {
                    model: Rooms,
                    as: "Room", // Alias explícito
                    attributes: [
                        "id",
                        "roomType",
                        "pricePerNight",
                        "roomNumber",
                    ],
                },
            ],
        });

        const occupiedDatesByRoom = {};
        reservations.forEach((reservation) => {
            if (reservation.Room) {
                const roomId = reservation.Room.id;
                if (!occupiedDatesByRoom[roomId]) {
                    occupiedDatesByRoom[roomId] = new Set();
                }

                let currentDate = new Date(reservation.checkInDate);
                const end = new Date(reservation.checkOutDate);

                while (currentDate <= end) {
                    occupiedDatesByRoom[roomId].add(
                        currentDate.toISOString().split("T")[0]
                    );
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
        });

        const allRooms = await Rooms.findAll({
            attributes: ["id", "roomType", "pricePerNight", "roomNumber"],
        });

        // Objeto para agrupar habitaciones por tipo
        const availableRoomsByType = {};

        allRooms.forEach((room) => {
            const roomId = room.id;
            const roomDetails = {
                type: room.roomType,
                pricePerNight: room.pricePerNight,
                availableDates: [],
            };

            let date = new Date(startDate);
            const finalDate = new Date(endDate);

            while (date <= finalDate) {
                const dateString = date.toISOString().split("T")[0];
                if (!occupiedDatesByRoom[roomId]?.has(dateString)) {
                    roomDetails.availableDates.push(dateString);
                }
                date.setDate(date.getDate() + 1);
            }

            // Agrupar habitaciones por tipo
            if (!availableRoomsByType[roomDetails.type]) {
                availableRoomsByType[roomDetails.type] = {
                    pricePerNight: roomDetails.pricePerNight,
                    roomNumber: roomDetails.roomNumber,
                    availableDates: roomDetails.availableDates,
                };
            } else {
                // Unir las fechas disponibles
                availableRoomsByType[roomDetails.type].availableDates = [
                    ...new Set([
                        ...availableRoomsByType[roomDetails.type]
                            .availableDates,
                        ...roomDetails.availableDates,
                    ]),
                ];
            }
        });

        // Convertir el objeto a un array de resultados
        const respuesta = Object.entries(availableRoomsByType).map(
            ([type, details]) => ({
                type,
                pricePerNight: details.pricePerNight,
                roomNumber: details.roomNumber,
                availableDates: details.availableDates.sort(
                    (a, b) => new Date(a) - new Date(b)
                ), // Ordenar fechas
            })
        );
        return respuesta;
    } catch (error) {
        console.error(error);
        throw new Error("Error retrieving available dates");
    }
};

module.exports = {
    getAllReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    getReservationsByDateRange,
    calculateAvailabilityAndCost,
    getAvailableDates,
};
