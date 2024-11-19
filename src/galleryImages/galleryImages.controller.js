const { v4: uuidv4 } = require("uuid");
const path = require("path");
const GalleryImages = require("../models/galleryImages.models");

const uploadImage = async (req, res) => {
    try {
        const { galleryId, altText } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res
                .status(400)
                .json({ message: "No se ha subido ninguna imagen." });
        }

        // Guardar todas las imágenes en la base de datos
        const newImages = await Promise.all(
            files.map((file) => {
                const imageUrl = path.join("uploads/images", file.filename);
                return GalleryImages.create({
                    id: uuidv4(),
                    galleryId,
                    imageUrl,
                    altText: altText || null,
                });
            })
        );

        res.status(201).json({
            message: "Imágenes subidas y registradas con éxito.",
            data: newImages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al subir las imágenes.",
            error,
        });
    }
};

module.exports = {
    uploadImage,
};
