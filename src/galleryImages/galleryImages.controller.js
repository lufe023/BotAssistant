const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Galleries = require("../models/galleries.models");
const GalleryImages = require("../models/galleryImages.models");
const Rooms = require("../models/rooms.models");
const { deleteImageController } = require("../images/images.controller");

const uploadImages = async (req, res) => {
    try {
        const { galleryName, roomId, descriptions } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res
                .status(400)
                .json({ message: "No se ha subido ninguna imagen." });
        }

        let galleryId;

        // Crear o encontrar la galería
        if (galleryName) {
            const existingGallery = await Galleries.findOne({
                where: { name: galleryName },
            });
            if (existingGallery) {
                galleryId = existingGallery.id;
            } else {
                const newGallery = await Galleries.create({
                    id: uuidv4(),
                    name: galleryName,
                    details: "Galería creada automáticamente",
                });
                galleryId = newGallery.id;
            }
        } else {
            return res
                .status(400)
                .json({ message: "El nombre de la galería es requerido." });
        }

        // Asociar la galería con una habitación, si se proporciona
        if (roomId) {
            await Rooms.update({ galleryId }, { where: { id: roomId } });
        }

        // Guardar imágenes en la base de datos
        const newImages = await Promise.all(
            files.map((file, index) => {
                const altText =
                    descriptions[index] ||
                    `Descripción de la imagen ${index + 1}`;
                const imageUrl = path.join(file.filename);

                return GalleryImages.create({
                    id: uuidv4(),
                    galleryId,
                    imageUrl,
                    altText,
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
            error: error.message,
        });
    }
};

const deleteGalleryImage = async (req, res) => {
    const { id } = req.params; // ID de la imagen en la base de datos

    try {
        // Busca la imagen en la base de datos
        const image = await GalleryImages.findOne({ where: { id } });

        if (!image) {
            return res.status(404).json({ message: "Imagen no encontrada" });
        }

        // Obtén el nombre de la imagen desde el imageUrl
        const imageName = path.basename(image.imageUrl); // Extrae el nombre del archivo
        const folder = "images"; // Carpeta donde están las imágenes

        // Llama al controlador para eliminar la imagen física
        const deleteResult = await deleteImageController(folder, imageName);

        if (!deleteResult.success) {
            return res.status(500).json({
                message: "Error al eliminar la imagen física",
                error: deleteResult.message,
            });
        }

        // Elimina el registro de la imagen en la base de datos
        await GalleryImages.destroy({ where: { id } });

        return res
            .status(200)
            .json({ message: "Imagen eliminada correctamente" });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error al eliminar la imagen", error });
    }
};

module.exports = { uploadImages, deleteGalleryImage };
