// rooms.service.js
const roomsControllers = require("./rooms.controllers");

const getAllRooms = (req, res) => {
    const offset = Number(req.query.offset) || 0; // Inicio
    const limit = Number(req.query.limit) || 10; // Capacidad máxima

    const urlBase = `${req.protocol}://${req.get("host")}/api/v1/rooms`;

    roomsControllers
        .getAllRooms(offset, limit)
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

const getRoomById = (req, res) => {
    const { id } = req.params;
    roomsControllers
        .getRoomById(id)
        .then((room) => {
            if (room) {
                res.status(200).json(room);
            } else {
                res.status(404).json({ message: "Room not found" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const createRoom = (req, res) => {
    roomsControllers
        .createRoom(req.body)
        .then((room) => {
            res.status(201).json(room);
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const updateRoom = (req, res) => {
    const { id } = req.params;
    roomsControllers
        .updateRoom(id, req.body)
        .then((updatedRoom) => {
            if (updatedRoom) {
                res.status(200).json(updatedRoom);
            } else {
                res.status(404).json({ message: "Room not found" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const deleteRoom = (req, res) => {
    const { id } = req.params;
    roomsControllers
        .deleteRoom(id)
        .then((deleted) => {
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: "Room not found" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const getRoomHistory = (req, res) => {
    const { id } = req.params;
    roomsControllers
        .getRoomHistory(id)
        .then((data) => {
            if (data) {
                res.status(200).json(data);
            } else {
                res.status(404).json({ message: "Room not found" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    getRoomHistory,
};
