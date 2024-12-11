// routes/reservations.router.js
const express = require("express");
const router = express.Router();
const reservationsServices = require("./reservations.services");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware"); // Asegúrate de tener este middleware
const upload = require("../utils/multer");

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    reservationsServices.getAllReservations
);

router.get(
    "/getReservationsToWork",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    reservationsServices.getReservationsToWork
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

router.post(
    "/upload-voucher/:reservationId",
    upload.single("voucher"),
    async (req, res) => {
        try {
            const { reservationId } = req.params;

            // Verificar si se subió un archivo
            if (!req.file) {
                return res
                    .status(400)
                    .json({ message: "No se encontró el archivo." });
            }

            const fileName = req.file.filename;

            // Verificar si la reservación existe
            const reservation = await Reservations.findByPk(reservationId);
            if (!reservation) {
                // Eliminar el archivo si la reservación no existe
                fs.unlinkSync(
                    path.join(__dirname, "../../uploads/images", fileName)
                );
                return res
                    .status(404)
                    .json({ message: "Reservación no encontrada." });
            }

            // Actualizar la columna voucher
            reservation.voucher = fileName;
            await reservation.save();

            res.status(200).json({
                message: "Comprobante de pago cargado exitosamente.",
                fileName,
            });
        } catch (error) {
            console.error("Error al subir el comprobante:", error);
            res.status(500).json({
                message: "Error interno al procesar el archivo.",
            });
        }
    }
);

module.exports = router;
