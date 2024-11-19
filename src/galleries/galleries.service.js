const galleriesControllers = require("./galleries.controller");

const getAllGalleries = (req, res) => {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 10;

    galleriesControllers
        .getAllGalleries(offset, limit)
        .then((data) => {
            res.status(200).json({
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

const getGalleryById = (req, res) => {
    const { id } = req.params;
    galleriesControllers
        .getGalleryById(id)
        .then((gallery) => {
            gallery
                ? res.status(200).json(gallery)
                : res.status(404).json({ message: "Gallery not found" });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const createGallery = (req, res) => {
    galleriesControllers
        .createGallery(req.body)
        .then((gallery) => {
            res.status(201).json(gallery);
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const updateGallery = (req, res) => {
    const { id } = req.params;
    galleriesControllers
        .updateGallery(id, req.body)
        .then((updatedGallery) => {
            updatedGallery
                ? res.status(200).json(updatedGallery)
                : res.status(404).json({ message: "Gallery not found" });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

const deleteGallery = (req, res) => {
    const { id } = req.params;
    galleriesControllers
        .deleteGallery(id)
        .then((deleted) => {
            deleted
                ? res.status(204).send()
                : res.status(404).json({ message: "Gallery not found" });
        })
        .catch((err) => {
            res.status(400).json({ message: err.message });
        });
};

module.exports = {
    getAllGalleries,
    getGalleryById,
    createGallery,
    updateGallery,
    deleteGallery,
};
