const areasController = require("./areas.controllers");

// Obtener todas las áreas
const getAllAreasService = (req, res) => {
    areasController
        .getAllAreasController()
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

// Obtener un área por ID
const getAreaByIdService = (req, res) => {
    const { id } = req.params;
    areasController
        .getAreaByIdController(id)
        .then((area) => {
            if (area) {
                res.status(200).json(area);
            } else {
                res.status(404).json({ message: "Área no encontrada" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

// Crear una nueva área
const createNewAreaService = (req, res) => {
    const { name, description } = req.body;

    if (name) {
        areasController
            .createNewAreaController({ name, description })
            .then((newArea) => {
                res.status(201).json(newArea);
            })
            .catch((err) => {
                res.status(400).json({ message: err.message });
            });
    } else {
        res.status(400).json({
            message: "Todos los campos requeridos deben ser completados",
            fields: {
                name: "string",
                description: "string (opcional)",
            },
        });
    }
};

// Actualizar un área por ID
const updateAreaService = (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (name) {
        areasController
            .updateAreaController(id, { name, description })
            .then((updatedArea) => {
                if (updatedArea) {
                    res.status(200).json(updatedArea);
                } else {
                    res.status(404).json({ message: "Área no encontrada" });
                }
            })
            .catch((err) => {
                res.status(400).json({ message: err.message });
            });
    } else {
        res.status(400).json({
            message: "El campo 'name' es obligatorio",
            fields: {
                name: "string",
                description: "string (opcional)",
            },
        });
    }
};

// Eliminar un área por ID
const deleteAreaService = (req, res) => {
    const { id } = req.params;

    areasController
        .deleteAreaController(id)
        .then((deleted) => {
            if (deleted) {
                res.status(200).json({ message: "Área eliminada con éxito" });
            } else {
                res.status(404).json({ message: "Área no encontrada" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

module.exports = {
    getAllAreasService,
    getAreaByIdService,
    createNewAreaService,
    updateAreaService,
    deleteAreaService,
};
