const express = require("express");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware");
const galleriesServices = require("./galleries.service");

const router = express.Router();

router.get("/", galleriesServices.getAllGalleries);
router.get(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    galleriesServices.getGalleryById
);
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    galleriesServices.createGallery
);
router.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    galleriesServices.updateGallery
);
router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    galleriesServices.deleteGallery
);

module.exports = router;
