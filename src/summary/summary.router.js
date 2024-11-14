// rooms.routes.js
const express = require("express");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware"); // Asegúrate de tener este middleware

const summaryServices = require("./summary.services");

const router = express.Router();

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    summaryServices.getAllRooms
);

router.get(
    "/rooms",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    summaryServices.getRoomStatusSummary
);

module.exports = router;
