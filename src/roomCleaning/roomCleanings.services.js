// services/roomCleanings.services.js
const cleaningsControllers = require("./roomCleanings.controllers");

const getAllCleanings = (req, res) => {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 10;

    cleaningsControllers
        .getAllCleanings(offset, limit)
        .then((data) => res.status(200).json(data))
        .catch((err) => res.status(400).json({ message: err.message }));
};

const getCleaningById = (req, res) => {
    const { id } = req.params;

    cleaningsControllers
        .getCleaningById(id)
        .then((data) => {
            if (data) res.status(200).json(data);
            else res.status(404).json({ message: "Cleaning not found" });
        })
        .catch((err) => res.status(400).json({ message: err.message }));
};

const createCleaning = (req, res) => {
    const cleaningData = req.body;

    cleaningsControllers
        .createCleaning(cleaningData)
        .then((data) => res.status(201).json(data))
        .catch((err) => res.status(400).json({ message: err.message }));
};

const updateCleaning = (req, res) => {
    const { id } = req.params;
    const cleaningData = req.body;

    cleaningsControllers
        .updateCleaning(id, cleaningData)
        .then((data) => {
            res.status(201).json(data);
        })
        .catch((err) => res.status(400).json({ err }));
};

const deleteCleaning = (req, res) => {
    const { id } = req.params;

    cleaningsControllers
        .deleteCleaning(id)
        .then((data) => {
            if (data) res.status(204).send();
            else res.status(404).json({ message: "Cleaning not found" });
        })
        .catch((err) => res.status(400).json({ message: err.message }));
};

module.exports = {
    getAllCleanings,
    getCleaningById,
    createCleaning,
    updateCleaning,
    deleteCleaning,
};
