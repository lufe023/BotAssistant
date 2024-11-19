const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { uploadImage } = require("./galleryImages.controller");

// Ruta para subir imágenes
router.post("/upload", upload.array("images"), uploadImage);

module.exports = router;
