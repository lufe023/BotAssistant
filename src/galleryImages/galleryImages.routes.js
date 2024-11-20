const express = require("express");
const router = express.Router();
const upload = require("../utils/multer"); // Ruta a tu configuración de multer
const { uploadImages } = require("./galleryImages.controller");

router.post("/upload", upload.array("files", 10), uploadImages);

module.exports = router;
