// controllers/reservations.controllers.js
const Reservations = require("../models/reservations.models");
const uuid = require("uuid");
const Rooms = require("../models/rooms.models");
const { Op } = require("sequelize");
const Users = require("../models/users.models");
const Chats = require("../models/chats.models");
const Messages = require("../models/messages.models");
const { getClient } = require("../whatsapp/whatsappClient");
const { format } = require("date-fns");
const { es } = require("date-fns/locale"); // Importación directa de la localización

const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajuste manual
    return format(date, "dd '-' MMMM ' -' yyyy", { locale: es });
};

const sentToWhatsapp = async (chatId, message) => {
    let number = `${chatId}@c.us`;

    const client = getClient(); // Obtén el cliente de WhatsApp
    await client.sendMessage(number, message);
};

const getReservationById = async (id) => {
    const reservation = await Reservations.findOne({
        where: { id },
        include: [
            {
                model: Users,
                as: "guest",
                attributes: {
                    exclude: ["password"],
                },
            },
            {
                model: Rooms,
                as: "Room",
            },
        ],
    });

    return await reservation;
};

const updateReservationAndNotify = async (id, agentId, reservationData) => {
    try {
        // Obtener la reservación por su ID
        const reservation = await getReservationById(id);
        if (!reservation) {
            throw new Error("Reservación no encontrada");
        }

        // Actualizar la información de la reservación
        await reservation.update(reservationData);

        // Actualizar el estado de la reservación si se proporciona
        if (reservationData.status) {
            reservation.status = reservationData.status;
            await reservation.save();
        }

        if (reservationData.announce === true) {
            // Verificar si ya existe un chat para esta reservación
            let chat = await Chats.findOne({
                where: {
                    userId: reservation.userId,
                    // agentId: reservation.agentId,
                    // status: "active",
                },
            });

            // Si no existe un chat, crear uno nuevo
            if (!chat) {
                chat = await Chats.create({
                    id: uuid.v4(),
                    userId: reservation.userId,
                    agentId: agentId, // Agente asignado a la reservación
                    status: "completed", // Estado inicial del chat
                    createdAt: new Date(),
                });
            }

            // Definir los mensajes según el estado
            const statusMessages = {
                Pending: "Su reservación está *pendiente* de confirmación.",
                Approved:
                    "Su reservación ha sido *aprobada* y está lista para ser utilizada.",
                Rejected:
                    "Su reservación ha sido *rechazada* debido a la falta de disponibilidad u otras razones.",
                Cancelled: "Su reservación ha sido *cancelada.*",
                Completed: "Su reservación ha sido completada.",
                "No show":
                    "No se presentó para usar la reservación, pero el pago fue realizado.",
                Expired: "Su reservación ha expirado.",
            };

            // Construir el mensaje detallado
            const messageContent = `${statusMessages[reservation.status]}

*Detalles de la reservación:*
- Tipo de habitación: ${reservation.Room.roomType}
- Fecha de entrada: ${formatDate(reservation.checkIn)}
- Fecha de salida: ${formatDate(reservation.checkOut)}
- Precio total: $${reservation.totalPrice}
`;

            // Crear el mensaje
            await Messages.create({
                id: uuid.v4(),
                chatId: chat.id,
                senderId: agentId,
                message: messageContent,
                createdAt: new Date(),
            });

            // Enviar notificación vía WhatsApp
            await sentToWhatsapp(reservation.guest.phone, messageContent);
        }
        return {
            reservation,
        };
    } catch (error) {
        console.error("Error en updateReservationAndNotify:", error.message);
        throw new Error("Error al actualizar la reservación y notificar");
    }
};

module.exports = {
    getReservationById,
    updateReservationAndNotify,
};
