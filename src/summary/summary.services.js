const summaryControllers = require("./summary.controllers");

const getAllRooms = (req, res) => {
    const offset = Number(req.query.offset) || 0; // Inicio
    const limit = Number(req.query.limit) || 10; // Capacidad máxima

    const urlBase = `${req.protocol}://${req.get("host")}/api/v1/rooms`;

    summaryControllers
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

const getRoomStatusSummary = (req, res) => {
    const ubication = req.query.ubication || "";
    console.log(ubication);
    summaryControllers
        .getRoomStatusSummary(ubication)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

module.exports = {
    getAllRooms,
    getRoomStatusSummary,
};
