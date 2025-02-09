// rooms.routes.js
const express = require("express");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware"); // Asegúrate de tener este middleware

const roomsServices = require("./rooms.services");

const router = express.Router();

router.get("/", roomsServices.getAllRooms);

router.get(
    "/history/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    roomsServices.getRoomHistory
);

router.get(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    roomsServices.getRoomById
);

router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    roomsServices.createRoom
);
router.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    roomsServices.updateRoom
);
router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    roomsServices.deleteRoom
);

// Ruta para crear múltiples habitaciones
router.post(
    "/batch",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    roomsServices.createRoomsBatch
);

module.exports = router;
