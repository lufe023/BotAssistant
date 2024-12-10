const Zmoment = require("moment-timezone");
const months = require("./monthName.json");
const Chats = require("../models/chats.models");
const Messages = require("../models/messages.models");
const moment = require("moment-timezone");
const formatAvailability = (response, checkInDate, checkOutDate) => {
    const availabilityDetails = [];

    // Establecer el idioma en español
    Zmoment.locale("es");

    // Convertir las fechas de entrada y salida a Date en la zona horaria de Santo Domingo
    const checkIn = Zmoment.tz(checkInDate, "America/Santo_Domingo")
        .startOf("day")
        .toDate();

    // Aseguramos que la salida sea la mañana del 1 de diciembre
    const checkOut = Zmoment.tz(checkOutDate, "America/Santo_Domingo")
        .startOf("day") // Ajustamos para que sea al inicio del día, es decir, la mañana del 1 de diciembre
        .toDate();

    // Función para formatear una fecha en español en la zona horaria de Santo Domingo
    const formatDate = (dateString) => {
        return Zmoment.tz(dateString, "America/Santo_Domingo").format(
            "D [de] MMMM [de] YYYY"
        );
    };

    // Función para obtener intervalos de fechas consecutivas
    const getDateRanges = (dates) => {
        const ranges = [];
        let start = dates[0];

        for (let i = 1; i < dates.length; i++) {
            const currentDate = new Date(dates[i]);
            const previousDate = new Date(dates[i - 1]);

            // Si la fecha actual no es el día siguiente de la anterior, finaliza el rango actual
            if ((currentDate - previousDate) / (1000 * 60 * 60 * 24) !== 1) {
                ranges.push({ start, end: dates[i - 1] });
                start = dates[i];
            }
        }
        // Agrega el último rango
        ranges.push({ start, end: dates[dates.length - 1] });

        return ranges;
    };

    // Obtener las habitaciones disponibles
    const availableRooms = response.map((room) => [
        room.type,
        room.roomNumber,
        room.roomId,
    ]);
    const chatState = {
        availableRooms: availableRooms,
    };
    console.log(chatState.availableRooms);

    // Recorrer la respuesta de habitaciones
    response.forEach((room) => {
        const { type, pricePerNight, availableDates } = room;

        // Filtrar las fechas disponibles que están dentro del rango solicitado
        const filteredAvailableDates = availableDates.filter((date) => {
            const currentDate = Zmoment.tz(
                date,
                "America/Santo_Domingo"
            ).toDate();
            return currentDate >= checkIn && currentDate <= checkOut;
        });

        // Obtener los intervalos de fechas consecutivas
        const dateRanges = getDateRanges(filteredAvailableDates);

        // Formatear los intervalos en texto
        const availablePeriods = dateRanges.map((range) => {
            // Sumar un día a la fecha de salida para indicar la mañana del día siguiente
            const nextDay = new Date(range.end);
            nextDay.setDate(nextDay.getDate() + 1); // Sumamos 1 día

            return `desde ${formatDate(
                range.start
            )} hasta la mañana del ${formatDate(checkOutDate)}`;
        });

        // Unir los periodos en un string
        const availableText = availablePeriods.join(" y ");

        // Formato final para el cliente
        availabilityDetails.push(
            `Tipo de habitación: *${type}* \nPrecio por noche: $${pricePerNight}\nFechas disponibles: ${availableText}`
        );
    });

    // Información general (ajustado para mostrar la salida en la mañana del 1 de diciembre)
    return (
        `Esta es nuestra disponibilidad:\nEntrada: ${formatDate(
            checkInDate
        )}\nSalida: la mañana del ${formatDate(checkOutDate)}\n\n` +
        availabilityDetails.join("\n\n")
    );
};

const uuid = require("uuid");

const parseDate = (inputDate) => {
    // Normalizar la fecha reemplazando separadores por espacios y pasándola a minúsculas
    const normalizedDate = inputDate
        .trim()
        .toLowerCase()
        .replace(/[ - . , _ / ]/g, " ");
    let parsedDate;

    // Formato "01 noviembre 24" o "1 nov 2024"
    const monthNameMatch = normalizedDate.match(
        /^(\d{1,2})\s+([a-záéíóúñ]+)\s+(\d{2}|\d{4})$/
    );

    if (monthNameMatch) {
        const day = monthNameMatch[1].padStart(2, "0");
        const monthName = monthNameMatch[2];
        let month;

        // Buscar el mes en las variaciones
        for (const [monthNumber, monthInfo] of Object.entries(months)) {
            if (monthInfo.variations.includes(monthName)) {
                month = monthNumber; // Obtener el número del mes
                break;
            }
        }

        if (!month) {
            return null; // Si el mes no es válido, retornar null
        }

        const year =
            monthNameMatch[3].length === 2
                ? `20${monthNameMatch[3]}`
                : monthNameMatch[3];
        parsedDate = moment(`${year}-${month}-${day}`, "YYYY-MM-DD");
    }
    // Formatos "dd/mm/yyyy" o "dd-mm-yy", admite varios separadores
    else if (/^\d{1,2}[ \/.\-_]\d{1,2}[ \/.\-_]\d{2,4}$/.test(normalizedDate)) {
        const [day, month, year] = normalizedDate
            .split(/[ \/.\-_]/)
            .map((num) => num.padStart(2, "0"));
        const fullYear = year.length === 2 ? `20${year}` : year;
        parsedDate = moment(`${fullYear}-${month}-${day}`, "YYYY-MM-DD");
    }
    // Formato "ddmmyyyy" o "ddmmyy" (todo junto)
    else if (/^\d{6,8}$/.test(normalizedDate)) {
        const day = normalizedDate.slice(0, 2);
        const month = normalizedDate.slice(2, 4);
        const year = normalizedDate.slice(4);
        const fullYear = year.length === 2 ? `20${year}` : year;
        parsedDate = moment(`${fullYear}-${month}-${day}`, "YYYY-MM-DD");
    }

    return parsedDate && parsedDate.isValid() ? parsedDate : null;
};

const handleCreateChatWitMessage = async (chatData, initialMessageData) => {
    try {
        // Buscar un chat existente para el usuario
        let chat = await Chats.findOne({
            where: {
                userId: chatData.userId,
            },
        });

        if (chat) {
            // Si existe un chat y su estado es "completed", actualizar a "active"
            if (chat.status === "completed") {
                await chat.update({ status: "active", agentId: null });
            }
        } else {
            // Si no existe un chat, crear uno nuevo
            chat = await Chats.create({
                id: uuid.v4(),
                userId: chatData.userId,
                agentId: chatData.agentId,
                status: "active", // Estado inicial del chat
                createdAt: new Date(),
            });
        }

        // Crear el mensaje inicial asociado al chat existente o recién creado
        const newMessage = await Messages.create({
            id: uuid.v4(),
            chatId: chat.id,
            senderId: initialMessageData.senderId,
            content: initialMessageData.content || "El chat ha sido iniciado.",
            message: initialMessageData.message,
            createdAt: new Date(),
        });

        return { chat, message: newMessage };
    } catch (error) {
        console.error("Error al manejar el chat y el mensaje inicial:", error);
        throw new Error("No se pudo manejar el chat.");
    }
};
module.exports = {
    handleCreateChatWitMessage,
    formatAvailability,
    parseDate,
};
