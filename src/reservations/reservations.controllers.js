// controllers/reservations.controllers.js
const Reservations = require("../models/reservations.models");
const uuid = require("uuid");
const Rooms = require("../models/rooms.models");
const { Op } = require("sequelize");
const Configurations = require("../models/configurations.models");

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
    const { roomId, checkIn, checkOut } = reservationData;

    // Obtener valores predeterminados de configuración
    const config = await Configurations.findOne();
    if (!config) {
        throw new Error("No se encontraron configuraciones predeterminadas.");
    }

    // Asegurarse de que las fechas checkIn y checkOut sean válidas
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate.getTime())) {
        throw new Error("La fecha de entrada (checkIn) no es válida.");
    }

    if (isNaN(endDate.getTime())) {
        throw new Error("La fecha de salida (checkOut) no es válida.");
    }

    // Asegurarse de que las fechas sean válidas (no deben ser iguales a 'Fecha inválida')
    if (
        !checkIn ||
        !checkOut ||
        checkIn === "Fecha inválida" ||
        checkOut === "Fecha inválida"
    ) {
        throw new Error("Una de las fechas proporcionadas no es válida.");
    }

    // Asegurar que solo se usen las fechas, no las horas
    const startDateStr = startDate.toISOString().split("T")[0]; // Solo la fecha
    const endDateStr = endDate.toISOString().split("T")[0]; // Solo la fecha

    // Verificar si las horas de configuración están disponibles
    if (!config.defaultCheckInTime || !config.defaultCheckOutTime) {
        throw new Error(
            "Faltan configuraciones de hora predeterminada (defaultCheckInTime o defaultCheckOutTime)."
        );
    }

    // Crear fechas con las horas de configuración
    const finalCheckIn = `${startDateStr} ${config.defaultCheckInTime}`;
    const finalCheckOut = `${endDateStr} ${config.defaultCheckOutTime}`;

    console.log("Fechas generadas: ", finalCheckIn, finalCheckOut);

    // Verificar disponibilidad y calcular precio
    const { isAvailable, totalPrice } = await calculateAvailabilityAndCost(
        roomId,
        startDate,
        endDate
    );

    if (!isAvailable) {
        throw new Error(
            "La habitación no está disponible en el rango de fechas seleccionado."
        );
    }

    // Crear la reservación con los valores ajustados
    try {
        const reservation = await Reservations.create({
            id: uuid.v4(),
            ...reservationData,
            checkIn: finalCheckIn,
            checkOut: finalCheckOut,
            totalPrice,
        });

        return reservation;
    } catch (error) {
        console.error("Error al crear la reservación: ", error);
        throw new Error("Error al crear la reservación.");
    }
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

//obtener todas las fechas reservadas en un rango, pero tambien valida que la fecha de entrada sea posterior a la de salida
const calculateAvailabilityAndCost = async (roomId, checkIn, checkOut) => {
    // Buscar las reservaciones existentes para la habitación
    const reservations = await Reservations.findAll({
        where: { roomId },
    });

    // Verificar si hay conflictos en las fechas (considerando horas)
    const isAvailable = reservations.every((reservation) => {
        const existingCheckIn = new Date(reservation.checkIn);
        const existingCheckOut = new Date(reservation.checkOut);

        // Verificar si hay solapamiento con la nueva reservación
        return (
            checkOut <= existingCheckIn || // La salida es antes de que inicie la otra reservación
            checkIn >= existingCheckOut // La entrada es después de que termine la otra reservación
        );
    });

    if (!isAvailable) {
        return { isAvailable: false, totalPrice: 0 };
    }

    // Calcular el costo total (por ejemplo, basado en noches)
    const room = await Rooms.findByPk(roomId);
    if (!room) throw new Error("Habitación no encontrada");

    const durationInMs = new Date(checkOut) - new Date(checkIn);
    const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24)); // Convertir a días

    const totalPrice = durationInDays * room.pricePerNight;

    return { isAvailable: true, totalPrice };
};

const getAvailableDates = async (startDate, endDate) => {
    try {
        // Obtener configuraciones
        const config = await Configurations.findOne();
        if (!config) throw new Error("Configuraciones no definidas.");

        const { defaultCheckInTime, defaultCheckOutTime } = config;

        // Ajustar fechas con horas predeterminadas
        const adjustedStartDate = new Date(
            `${startDate} ${defaultCheckInTime}`
        );
        const adjustedEndDate = new Date(`${endDate} ${defaultCheckOutTime}`);

        // Obtener reservas dentro del rango de fechas
        const reservations = await Reservations.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            {
                                checkIn: {
                                    [Op.between]: [
                                        adjustedStartDate,
                                        adjustedEndDate,
                                    ],
                                },
                            },
                            {
                                checkOut: {
                                    [Op.between]: [
                                        adjustedStartDate,
                                        adjustedEndDate,
                                    ],
                                },
                            },
                            {
                                [Op.and]: [
                                    {
                                        checkIn: {
                                            [Op.lte]: adjustedStartDate,
                                        },
                                    },
                                    { checkOut: { [Op.gte]: adjustedEndDate } },
                                ],
                            },
                        ],
                    },
                ],
            },
            include: [
                {
                    model: Rooms,
                    as: "Room",
                    attributes: [
                        "id",
                        "roomType",
                        "pricePerNight",
                        "roomNumber",
                    ],
                },
            ],
        });

        // Crear mapa de fechas ocupadas por habitación
        const occupiedDatesByRoom = {};
        reservations.forEach((reservation) => {
            if (reservation.Room) {
                const roomId = reservation.Room.id;
                if (!occupiedDatesByRoom[roomId]) {
                    occupiedDatesByRoom[roomId] = new Set();
                }

                let currentDate = new Date(reservation.checkIn);
                const end = new Date(reservation.checkOut);

                while (currentDate < end) {
                    // Cambié <= a < para que no marque la fecha de checkOut como ocupada
                    occupiedDatesByRoom[roomId].add(
                        currentDate.toISOString().split("T")[0]
                    );
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
        });

        // Obtener todas las habitaciones
        const allRooms = await Rooms.findAll({
            attributes: ["id", "roomType", "pricePerNight", "roomNumber"],
        });

        // Calcular fechas disponibles por tipo de habitación
        const availableRoomsByType = {};

        allRooms.forEach((room) => {
            const roomId = room.id;
            const roomDetails = {
                type: room.roomType,
                roomNumber: room.roomNumber,
                roomId: room.id,
                pricePerNight: room.pricePerNight,
                availableDates: [],
            };

            let date = new Date(adjustedStartDate);
            const finalDate = new Date(adjustedEndDate);

            while (date <= finalDate) {
                const dateString = date.toISOString().split("T")[0];
                if (!occupiedDatesByRoom[roomId]?.has(dateString)) {
                    roomDetails.availableDates.push(dateString);
                }
                date.setDate(date.getDate() + 1);
            }

            if (roomDetails.availableDates.length > 0) {
                if (!availableRoomsByType[roomDetails.type]) {
                    availableRoomsByType[roomDetails.type] = {
                        pricePerNight: roomDetails.pricePerNight,
                        roomNumber: roomDetails.roomNumber,
                        roomId: roomDetails.roomId,
                        availableDates: roomDetails.availableDates,
                    };
                } else {
                    availableRoomsByType[roomDetails.type].availableDates = [
                        ...new Set([
                            ...availableRoomsByType[roomDetails.type]
                                .availableDates,
                            ...roomDetails.availableDates,
                        ]),
                    ];
                }
            }
        });

        // Formatear la respuesta
        const respuesta = Object.entries(availableRoomsByType).map(
            ([type, details]) => ({
                type,
                pricePerNight: details.pricePerNight,
                roomNumber: details.roomNumber,
                roomId: details.roomId,
                availableDates: details.availableDates.sort(
                    (a, b) => new Date(a) - new Date(b)
                ),
            })
        );

        return respuesta;
    } catch (error) {
        console.error(error);
        throw new Error("Error al obtener las fechas disponibles");
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
