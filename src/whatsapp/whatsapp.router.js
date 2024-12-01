const { sendMessage } = require("./whatsapp.controller");
const router = require("express").Router();
const passport = require("passport");

require("../middlewares/auth.middleware")(passport);

// Inicializa WhatsApp Client
require("./whatsappClient");

// Define la ruta para enviar mensajes
router.route("/send-message").post(sendMessage);

// router.post(
//     "/upload-voucher/:reservationId",
//     upload.single("voucher"),
//     async (req, res) => {
//         try {
//             const { reservationId } = req.params;

//             // Verificar que el archivo se haya cargado
//             if (!req.file) {
//                 return res
//                     .status(400)
//                     .json({ message: "Archivo no encontrado" });
//             }

//             const fileName = req.file.filename;

//             // Actualizar el registro de la reservación
//             const reservation = await Reservations.findByPk(reservationId);
//             if (!reservation) {
//                 return res
//                     .status(404)
//                     .json({ message: "Reservación no encontrada" });
//             }

//             reservation.voucher = fileName;
//             await reservation.save();

//             res.status(200).json({
//                 message: "Comprobante de pago cargado exitosamente",
//             });
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: "Error al subir el comprobante" });
//         }
//     }
// );

module.exports = router;
