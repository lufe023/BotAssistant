const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const path = require("path");
const fs = require("fs-extra");
const moment = require("moment");
const uuid = require("uuid");
const User = require("../models/users.models");
const Zmoment = require("moment-timezone");
require("moment/locale/es");
Zmoment.locale("es");
const { deleteQrImage } = require("../images/images.controller");
const {
    getUserByPhoneNumber,
    createUser,
} = require("../users/users.controllers");
const {
    getAvailableDates,
    createReservation,
} = require("../reservations/reservations.controllers");
const { handleUserMessage, waitAgentMessage } = require("./chatFlow");

function formatAvailability(response, checkInDate, checkOutDate) {
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
}

const Menu =
    "1️⃣ Consultar Disponibilidad.\n" +
    "2️⃣ Hacer Reservación.\n" +
    "3️⃣ Chatear con un Humano.";
// Función para reiniciar el cliente de WhatsApp en caso de error
const initializeClient = () => {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
    });

    // Función para generar imagen QR
    const generateQRImage = async (text, filePath) => {
        try {
            await qrcode.toFile(filePath, text);
            return true;
        } catch (error) {
            console.error("Error al generar el archivo de código QR:", error);
            return false;
        }
    };

    client.on("qr", (qr) => {
        const qrFilePath = path.join(__dirname, "./qr/qr.png");
        generateQRImage(qr, qrFilePath).then((success) => {
            if (success) {
                console.log("Código QR guardado en:", qrFilePath);
            } else {
                console.log("Error al guardar el código QR");
            }
        });
    });

    client.on("ready", () => {
        console.log("Client is ready!");
        deleteQrImage("../whatsapp/qr", "qr.png");
    });

    client.on("auth_failure", (msg) => {
        console.error("Falló la autenticación: ", msg);
        initializeClient();
    });

    client.on("disconnected", (reason) => {
        console.error("Cliente desconectado:", reason);
        initializeClient();
    });

    const chatStates = {};

    client.on("message", async (message) => {
        try {
            const chatId = message.from;
            const phone = chatId.split("@")[0]; // Extrae el número de teléfono
            const msgText = message.body.trim();

            // Inicializar el estado del chat si no existe
            if (!chatStates[chatId]) {
                chatStates[chatId] = { stage: 0, greeted: false, userData: {} };
            }
            const chatState = chatStates[chatId];

            // Saludo inicial
            if (
                chatState.stage === 0 &&
                !chatState.greeted &&
                !chatState.talkToAgent
            ) {
                const user = await getUserByPhoneNumber(phone);
                if (user) {
                    chatState.userData.id = user.id;
                    await message.reply(
                        `¡Hola ${user.firstName}! Bienvenido de nuevo. ¿En qué puedo ayudarte hoy?\n\n` +
                            Menu
                    );
                } else {
                    await message.reply(
                        "¡Hola! Soy el bot Asistente del Hotel y Restaurant Las Marias. 🤖 ¿En qué puedo ayudarte hoy?\n\n" +
                            Menu
                    );
                }
                chatState.greeted = true;
                chatState.stage = 1;
                return;
            } else if (
                chatState.greeted == true &&
                chatState.talkToAgent == true
            ) {
                //esto es solo un ejemplo de lo que vamos a ir haciendo
                message.reply("En unos minutos le responderemos");
                console.log(
                    "llegamos a la opcion donde el usuario quiere hablar"
                );
            }

            switch (chatState.stage) {
                case 1: // Menú de opciones
                    if (msgText === "1") {
                        await message.reply(
                            "Por favor, ingresa la fecha de entrada en formato DD/MM/AAAA."
                        );
                        chatState.stage = 1.1; // Cambiamos a la etapa de esperar la fecha de entrada
                    } else if (msgText === "2") {
                        const user = await getUserByPhoneNumber(phone);
                        if (!user?.firstName) {
                            await message.reply(
                                "Para realizar una reservación, necesito registrarte en nuestro sistema. Por favor, envíame tu nombre completo."
                            );
                            chatState.stage = 2; // Espera nombre para registro
                        } else {
                            chatState.userData.id = user.id;
                            chatState.userData.firstName = user.firstName;
                            await message.reply(
                                `Que bien! ${user.firstName}, Para realizar una reservación, por favor indícame la fecha de entrada en formato DD/MM/AAAA.`
                            );
                            chatState.stage = 2.1; // Cambia a esperar fecha de entrada
                        }
                    } else if (msgText === "3") {
                        const user = await getUserByPhoneNumber(phone);
                        if (user) {
                            chatState.stage = 0;
                            chatState.greeted = true;
                            chatState.talkToAgent = true;
                            chatState.userData.id = user.id;

                            await message.reply(
                                `Excelente! ${user.firstName}, en breve uno de nuestros agentes le atenderá.`
                            );

                            await handleUserMessage(message, chatState, phone);
                            await createChatWithMessage(
                                { userId: user.id, agentId: null },
                                {
                                    senderId: user.id,
                                    content:
                                        "Quiero hablar con un representante",
                                    message:
                                        "Quiero hablar con un representante",
                                }
                            );
                        } else {
                            await message.reply(
                                "bien, indiqueme su nombre y de inmediato un agente nuestro le atenderá"
                            );
                            //esperando que el usuario responda

                            chatState.userData.fullName = msgText;

                            if (chatState.userData.fullName) {
                                await message.reply(
                                    "¿Confirma que este es su nombre correcto? responda con un Si, o con el nombre correcto"
                                );
                            } else if (msgText.toLocaleLowerCase == "si") {
                                // Registrar al usuario
                                const createUser = await User.create({
                                    id: uuid.v4(),
                                    phone: phone,
                                    firstName: chatState.userData.fullName,
                                    lastName: "",
                                    picture: "",
                                    status: "active", // Establecer el estado del nuevo usuario a 'active'
                                    active: true,
                                    role: 1,
                                });
                                chatState.userData.id = createUser.id;
                                chatState.userData.isRegistered = true;
                            } else {
                                chatState.userData.fullName = msgText;
                            }
                        }

                        // await handleUserMessage(message, chatState, phone);
                    } else {
                        await message.reply(
                            "Opción no válida. Por favor, elige un número de la lista:\n\n" +
                                Menu
                        );
                    }
                    break;

                case 1.1: // Espera la fecha de entrada
                    handleDisponibilidad(msgText, message, chatState);
                    break;

                case 1.3: // Espera la fecha de salida
                    handleFechaSalida(msgText, message, chatState);
                    break;

                case 2: // Espera nombre para registro
                    chatState.userData.fullName = msgText;
                    // Registrar al usuario
                    const createUser = await User.create({
                        id: uuid.v4(),
                        phone: phone,
                        firstName: msgText,
                        lastName: "",
                        picture: "",
                        status: "active", // Establecer el estado del nuevo usuario a 'active'
                        active: true,
                        role: 1,
                    });
                    chatState.userData.id = createUser.id;
                    chatState.userData.isRegistered = true;

                    await message.reply(
                        `Gracias, ${msgText}. Ahora estás registrado. Por favor, indícame la fecha de *entrada* en formato día, mes y año.`
                    );
                    chatState.stage = 2.1; // Vuelve a la etapa de pedir fecha de entrada
                    break;
                case 2.1:
                    //esperar que indique la fecha para entrar para luego enviarlo a la fecha de salida y ser enviando ambos datos a
                    handleReservationCheckin(msgText, message, chatState);
                    break;
                case 2.2:
                    //esperar que indique la fecha para entrar para luego enviarlo a la fecha de salida y ser enviando ambos datos a
                    handleReservationCheckout(msgText, message, chatState);
                    break;

                case 2.3:
                    handleDoReservation(msgText, message, chatState);
                    break;
                case 2.4:
                    handleConfirmReservation(msgText, message, chatState);
                    break;
                case 2.5:
                    handleGetImage(msgText, message, chatState);
                    break;
                case 3:
                    console.log("Stage 3");
                    break;
            }
        } catch (error) {
            console.error("Error al procesar el mensaje:", error);
        }
    });

    client.initialize();
};

// Llamar a la función para iniciar el cliente
initializeClient();

const months = require("./monthName.json");
const Reservations = require("../models/reservations.models");
const {
    sendNotification,
} = require("../notifications/notifications.controllers");
const { createChatWithMessage } = require("../chats/chats.controllers");

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

const handleDisponibilidad = async (msgText, message, chatState) => {
    // Validar la fecha de entrada
    const entryDate = parseDate(msgText);

    if (entryDate && entryDate.isSameOrAfter(moment().startOf("day"))) {
        chatState.startDate = entryDate.format("YYYY-MM-DD");
        await message.reply(
            "¡Perfecto! Ahora indícame, ¿cuándo te gustaría terminar esta aventura? Ingresa la fecha de salida en el formato adecuado."
        );
        chatState.stage = 1.3;
    } else if (entryDate) {
        await message.reply(
            "Oh, parece que elegiste una fecha que ya se ha ido. Por favor, ingresa una nueva fecha de entrada."
        );
    } else {
        await message.reply(
            "La fecha ingresada no es válida. Por favor, ingresa en uno de los formatos permitidos."
        );
    }
};

const handleFechaSalida = async (msgText, message, chatState) => {
    // Si no hay fecha ingresada, usar el día siguiente como fecha de salida
    const endDate =
        msgText.trim() === ""
            ? moment(chatState.startDate).add(1, "days")
            : parseDate(msgText);

    if (endDate && endDate.isAfter(chatState.startDate)) {
        chatState.endDate = endDate.format("YYYY-MM-DD");

        // Lógica para obtener disponibilidad
        const availableDates = await getAvailableDates(
            chatState.startDate,
            chatState.endDate
        );

        if (availableDates && availableDates.length > 0) {
            const responseMessage = formatAvailability(
                availableDates,
                chatState.startDate,
                chatState.endDate
            );
            await message.reply(responseMessage);

            await message.reply("Elija una opción del menu \n" + Menu);
            chatState.greeted = true;
            chatState.stage = 1;
        } else {
            await message.reply(
                "Lo siento, no hay habitaciones disponibles para esas fechas."
            );
        }
    } else if (endDate) {
        await message.reply(
            "La fecha de salida no es válida. Asegúrate de que sea posterior a la fecha de entrada."
        );
    } else {
        await message.reply(
            "Por favor, introduce la fecha de salida en un formato correcto: DD/MM/AAAA, DD.MM.AAAA, o DDMMAAAA."
        );
    }
};

const handleReservationCheckin = async (msgText, message, chatState) => {
    // Validar la fecha de entrada
    const entryDate = parseDate(msgText);

    if (entryDate && entryDate.isSameOrAfter(moment().startOf("day"))) {
        chatState.startDate = entryDate.format("YYYY-MM-DD");
        await message.reply(
            "¡Perfecto! Ahora indícame, ¿cuándo te gustaría terminar esta aventura? Ingresa la fecha de salida en el formato adecuado."
        );
        chatState.stage = 2.2; //para ir a pedir la fecha de salida y proceder a solicitar la reservacion
    } else if (entryDate) {
        await message.reply(
            "Oh, parece que elegiste una fecha que ya se ha ido. Por favor, ingresa una nueva fecha de entrada."
        );
    } else {
        await message.reply(
            "La fecha ingresada no es válida. Por favor, ingresa en uno de los formatos permitidos."
        );
    }
};

const handleReservationCheckout = async (msgText, message, chatState) => {
    // Paso 1: Si el usuario envió una fecha de finalización, se valida
    const endDate = parseDate(msgText);

    if (endDate && endDate.isSameOrAfter(moment().startOf("day"))) {
        chatState.endDate = endDate.format("YYYY-MM-DD");

        // Lógica para obtener disponibilidad
        const availableDates = await getAvailableDates(
            chatState.startDate,
            chatState.endDate
        );

        if (availableDates && availableDates.length > 0) {
            // Crear el menú de selección con los tipos de habitación y lo enviamos al usuario
            const roomOptions = availableDates
                .map((room, index) => {
                    return `${index + 1}. ${room.type} - $${
                        room.pricePerNight
                    } por noche`;
                })
                .join("\n");

            chatState.roomOptions = availableDates;
            // Enviar las opciones al usuario
            const menuMessage = `Por favor, elige el tipo de habitación:\n${roomOptions}`;
            await message.reply(menuMessage);
            chatState.stage = 2.3;
        }
    }
};

const handleDoReservation = async (msgText, message, chatState) => {
    const selectedRoom = chatState.roomOptions[msgText - 1];

    if (!selectedRoom) {
        await message.reply(
            "La opción seleccionada no es válida. Por favor, intenta nuevamente."
        );
        return;
    }

    chatState.selectedRoom = selectedRoom;

    const response = `Usted seleccionó: Habitación ${selectedRoom.type} con un costo de ${selectedRoom.pricePerNight}. \n escriba si, si esta de acuerdo con la seleccion o no para devolver el proceso`;

    await message.reply(response);
    chatState.stage = 2.4;
};

const handleConfirmReservation = async (msgText, message, chatState) => {
    const confirmation = msgText.toLowerCase();
    if (confirmation === "si") {
        console.log("El estado está en: " + JSON.stringify(chatState));

        let reservationData = {
            roomId: chatState.selectedRoom.roomId,
            userId: chatState.userData.id,
        };

        // Validar y formatear las fechas
        let startDate = new Date(chatState.startDate);
        let endDate = new Date(chatState.endDate);

        // Verificar que las fechas sean válidas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            await message.reply(
                "Parece que las fechas ingresadas no son válidas. Por favor, envíame las fechas correctas (formato: YYYY-MM-DD)."
            );
            return; // Salir de la función si las fechas no son válidas
        }

        // Formatear las fechas para asegurar que el formato sea correcto
        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];

        // Asignar las fechas formateadas a la reserva
        reservationData.checkIn = startDateStr;
        reservationData.checkOut = endDateStr;

        // Crear la reservación
        try {
            const reservation = await createReservation(reservationData);
            chatState.reservation = reservation;

            console.log(
                "La reservación es: " + JSON.stringify(chatState.reservation)
            );

            await message.reply(
                "¡Perfecto! 🎉 Su reservación se ha realizado con éxito. Ahora, por favor envíe el comprobante de pago para que uno de nuestros agentes lo revise y realice la confirmación final. 😊"
            );
            chatState.stage = 2.5;
        } catch (error) {
            console.error("Error al crear la reservación: ", error);
            await message.reply(
                "Hubo un error al realizar la reservación, por favor intenta nuevamente."
            );
        }
    } else {
        await message.reply(
            "¡Hola! Soy el bot Asistente del Hotel y Restaurant Las Marias. 🤖 ¿En qué puedo ayudarte hoy?\n\n" +
                Menu
        );
        chatState.stage = 1;
        chatState.greeted = true;
    }
};

const handleGetImage = async (msgText, message, chatState) => {
    try {
        if (!message.hasMedia) {
            await message.reply(
                "Por favor, envía una imagen válida como comprobante de pago."
            );
            chatState.stage = 2.5;
            return;
        }

        const media = await message.downloadMedia();
        if (!media) {
            await message.reply(
                "Nuestro servidor no pudo descargar el archivo. Intenta nuevamente."
            );
            chatState.stage = 2.5;
            return;
        }

        const allowedMimeTypes = ["image/jpeg", "image/png"];
        if (!allowedMimeTypes.includes(media.mimetype)) {
            await message.reply(
                "Formato de archivo no válido. Solo se aceptan imágenes (JPEG o PNG)."
            );
            return;
        }

        const uploadDir = path.join(__dirname, "../../uploads/images");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Guardar el archivo con un nombre único
        // const fileExtension = path.extname(media.filename || ".jpg");
        const fileExtension = path.extname(media.fileExtension || ".jpg");
        const fileName = `${
            chatState.reservation.id
        }-${Date.now()}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, media.data, "base64");

        // Actualizar la reservación con el nombre del archivo
        const reservation = await Reservations.findByPk(
            chatState.reservation.id
        );
        if (!reservation) {
            await message.reply(
                "No se encontró la reservación. Intenta nuevamente."
            );
            fs.unlinkSync(filePath); // Eliminar el archivo si no hay reservación
            return;
        }

        reservation.voucher = fileName;
        await reservation.save();

        await message.reply(
            "¡Comprobante de pago recibido y cargado exitosamente! Nuestros agentes revisarán tu comprobante y te confirmarán la reservación en breve. 😊"
        );
        chatState.stage = 0;
    } catch (error) {
        console.error("Error al manejar el archivo:", error);
        await message.reply(
            "Ocurrió un error al procesar el archivo. Intenta nuevamente."
        );
    }
};
