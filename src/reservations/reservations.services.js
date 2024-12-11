// services/reservations.services.js
const reservationsControllers = require("./reservations.controllers");

const getAllReservations = (req, res) => {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 10;
    const urlBase = `${req.protocol}://${req.get("host")}/api/v1/reservations`;

    reservationsControllers
        .getAllReservations(offset, limit)
        .then((data) => {
            const nextPage =
                data.count - offset > limit
                    ? `${urlBase}?offset=${offset + limit}&limit=${limit}`
                    : null;
            res.status(200).json({
                next: nextPage,
                prev:
                    offset > 0
                        ? `${urlBase}?offset=${Math.max(
                              offset - limit,
                              0
                          )}&limit=${limit}`
                        : null,
                offset,
                limit,
                count: data.count,
                results: data.rows,
            });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const getReservationsToWork = (req, res) => {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 50;
    const urlBase = `${req.protocol}://${req.get("host")}/api/v1/reservations`;

    reservationsControllers
        .getReservationsToWork(offset, limit)
        .then((data) => {
            const nextPage =
                data.count - offset > limit
                    ? `${urlBase}?offset=${offset + limit}&limit=${limit}`
                    : null;
            res.status(200).json({
                next: nextPage,
                prev:
                    offset > 0
                        ? `${urlBase}?offset=${Math.max(
                              offset - limit,
                              0
                          )}&limit=${limit}`
                        : null,
                offset,
                limit,
                count: data.count,
                results: data.rows,
            });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const getReservationById = (req, res) => {
    const { id } = req.params;
    reservationsControllers
        .getReservationById(id)
        .then((reservation) => {
            if (reservation) {
                res.status(200).json(reservation);
            } else {
                res.status(404).json({ message: "Reservation not found" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const createReservation = (req, res) => {
    const { userId, roomId, checkIn, checkOut } = req.body;

    // Validación de datos mínimos
    if (!userId || !roomId || !checkIn || !checkOut) {
        return res
            .status(400)
            .json({ message: "Datos incompletos para la reservación" });
    }

    // Pasar datos al controlador
    reservationsControllers
        .createReservation(req.body)
        .then((reservation) => {
            res.status(201).json(reservation);
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const updateReservation = (req, res) => {
    const { id } = req.params;
    reservationsControllers
        .updateReservation(id, req.body)
        .then((updatedReservation) => {
            if (updatedReservation) {
                res.status(200).json(updatedReservation);
            } else {
                res.status(404).json({ message: "Reservation not found" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const deleteReservation = (req, res) => {
    const { id } = req.params;
    reservationsControllers
        .deleteReservation(id)
        .then((deleted) => {
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: "Reservation not found" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

//Servicio para todas las fechas reservadas en un rango
const getReservationsByDateRange = (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res
            .status(400)
            .json({ message: "Missing startDate or endDate" });
    }

    reservationsControllers
        .getReservationsByDateRange(startDate, endDate)
        .then((reservations) => {
            res.status(200).json(reservations);
        })
        .catch((err) => {
            res.status(500).json({ message: err.message });
        });
};

//Servicio para obtener todas las fechas disponibles en un rango
const getAvailableDates = (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res
            .status(400)
            .json({ message: "Missing startDate or endDate" });
    }

    reservationsControllers
        .getAvailableDates(startDate, endDate)
        .then((availableDates) => {
            res.status(200).json({ availableDates });
        })
        .catch((err) => {
            res.status(500).json({ message: err.message });
        });
};

module.exports = {
    getAllReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    getReservationsByDateRange,
    getAvailableDates,
    getReservationsToWork,
};
