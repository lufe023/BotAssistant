// routes/reservations.router.js
const express = require("express");
const router = express.Router();
const reservationsServices = require("./reservations.services");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware"); // Asegúrate de tener este middleware

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    reservationsServices.getAllReservations
);
router.get("/date-range", reservationsServices.getReservationsByDateRange);
router.get("/available-dates", reservationsServices.getAvailableDates);

router.get(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    reservationsServices.getReservationById
);
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator", "Client"]),
    reservationsServices.createReservation
);
router.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    reservationsServices.updateReservation
);
router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator", "Client"]),
    reservationsServices.deleteReservation
);

module.exports = router;
