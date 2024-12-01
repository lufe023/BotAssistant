const express = require("express");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware");
const router = express.Router();
const upload = require("../utils/multer"); // Ruta a tu configuración de multer
const {
    uploadImages,
    deleteGalleryImage,
} = require("./galleryImages.controller");

router.post(
    "/upload",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    upload.array("files", 10),
    uploadImages
);

router.delete("/:id", deleteGalleryImage);

module.exports = router;
