const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const path = require("path");
const fs = require("fs-extra");
const moment = require("moment");
const uuid = require("uuid");
const User = require("../models/users.models");
const {
    formatAvailability,
    parseDate,
    handleCreateChatWitMessage,
} = require("./agentUtils");
const { deleteQrImage } = require("../images/images.controller");
const {
    getUserByPhoneNumber,
    updateUser,
} = require("../users/users.controllers");
const {
    getAvailableDates,
    createReservation,
} = require("../reservations/reservations.controllers");
const { handleUserMessage } = require("./chatFlow");

const Menu =
    "1️⃣ Consultar Disponibilidad.\n" +
    "2️⃣ Hacer Reservación.\n" +
    "3️⃣ Chatear con un Agente humano.";
// Función para reiniciar el cliente de WhatsApp en caso de error

let clientInstance;
let isClientReady = false;

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
        isClientReady = true;
        deleteQrImage("../whatsapp/qr", "qr.png");
    });

    client.on("auth_failure", (msg) => {
        console.error("Falló la autenticación: ", msg);
        initializeClient();
        isClientReady = false;
    });

    client.on("disconnected", (reason) => {
        console.error("Cliente desconectado:", reason);
        initializeClient();
        isClientReady = false;
    });

    const chatStates = {};

    client.on("message", async (message) => {
        try {
            const chatId = message.from;
            const phone = chatId.split("@")[0]; // Extrae el número de teléfono
            const msgText = message.body.trim();
            const user = await getUserByPhoneNumber(phone);
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
                if (user) {
                    chatState.userData.id = user.id;

                    if (user.isBotTalking === true) {
                        chatState.talkToAgent = true;
                        chatState.stage = 3.1;
                        chatState.greeted = true;

                        // Informar al cliente que será conectado con un agente
                        await message.reply(
                            "En este momento, te pondremos en contacto con uno de nuestros agentes. Por favor, espera un momento. 🙋‍♂️"
                        );
                    } else {
                        await message.reply(
                            `¡Hola ${user.firstName}! Bienvenido de nuevo. ¿En qué puedo ayudarte hoy?\n\n` +
                                Menu
                        );
                        chatState.stage = 1;
                    }
                }
                if (!user) {
                    await message.reply(
                        "¡Hola! Soy el bot Asistente del Hotel y Restaurant Las Marias. 🤖 ¿En qué puedo ayudarte hoy?\n\n" +
                            Menu
                    );
                    chatState.stage = 1;
                }

                chatState.greeted = true;

                return;
            }

            // // Manejo de la opción 3
            // if (msgText === "3") {
            //     const user = await getUserByPhoneNumber(phone);

            //     if (user) {
            //         // Actualiza el estado en la base de datos y en el chat
            //         await updateUser(user.id, { isBotTalking: true });
            //         chatState.stage = 3.1;
            //         chatState.talkToAgent = true;
            //         chatState.userData.id = user.id;

            //         // Notifica al cliente
            //         await message.reply(
            //             `¡Bien! ${user.firstName}, en breve uno de nuestros agentes le atenderá.`
            //         );

            //         // Registra el mensaje inicial en la conversación
            //         const chat = await handleCreateChatWitMessage(
            //             { userId: user.id, agentId: null },
            //             {
            //                 senderId: user.id,
            //                 content: "Quiero hablar con un representante",
            //                 message: "Quiero hablar con un representante",
            //             }
            //         );

            //         chatState.chat = chat;
            //         await handleUserMessage(message, chatState, phone);
            //     } else {
            //         // Caso en el que el usuario no está registrado
            //         chatState.stage = 3; // Espera el nombre
            //         await message.reply(
            //             "🤝🏻 De acuerdo, por favor indíqueme su nombre para ponerle en contacto con un agente."
            //         );
            //     }

            //     return; // Finaliza aquí para evitar más procesamiento
            // }

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
                            await message.reply(
                                `bien! ${user.firstName}, en breve uno de nuestros agentes le atenderá.`
                            );
                            chatState.stage = 3.1;
                            chatState.talkToAgent = true;
                            chatState.userData.id = user.id;
                            await updateUser(user.id, { isBotTalking: true });

                            await handleUserMessage(message, chatState, phone);

                            const chat = handleCreateChatWitMessage(
                                { userId: user.id, agentId: null },
                                {
                                    senderId: user.id,
                                    content:
                                        "Quiero hablar con un representante",
                                    message:
                                        "Quiero hablar con un representante",
                                }
                            );

                            chatState.chat = chat;
                        } else {
                            await message.reply(
                                "🤝🏻 de acuerdo, indiqueme su nombre y de inmediato un agente nuestro le atenderá"
                            );

                            chatState.stage = 3;
                            //esperando que el usuario responda
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
                    console.log("pidio hablar");
                    // Si no hay un nombre guardado previamente, guardar el nombre actual
                    if (!chatState.userData.fullName) {
                        chatState.userData.fullName = msgText;
                        await message.reply(
                            "¿Confirma que este es su nombre correcto? Responda con *Si*, o escriba el nombre correcto nuevamente."
                        );
                        break;
                    }

                    // Verificar si el mensaje es una confirmación
                    if (msgText.toLowerCase() === "si") {
                        // Registrar al usuario con el nombre confirmado
                        const createUser = await User.create({
                            id: uuid.v4(),
                            phone: phone,
                            firstName: chatState.userData.fullName,
                            lastName: "",
                            picture: "",
                            status: "active", // Establecer el estado del nuevo usuario a 'active'
                            active: true,
                            role: 1,
                            isBotTalking: true,
                        });

                        chatState.userData.id = createUser.id;
                        chatState.userData.isRegistered = true;
                        chatState.greeted = true;
                        chatState.talkToAgent = true;
                        chatState.stage = 3.1;

                        await message.reply(
                            `¡Bien! ${createUser.firstName}, en breve uno de nuestros agentes le atenderá.`
                        );

                        await handleUserMessage(message, chatState, phone);

                        let chatData = { userId: createUser.id, agentId: null };
                        let initialMessageData = {
                            senderId: createUser.id,
                            content: "Quiero hablar con un representante",
                            message: "Quiero hablar con un representante",
                        };

                        const chat = await handleCreateChatWitMessage(
                            chatData,
                            initialMessageData
                        );
                        chatState.chat = chat;
                    } else {
                        // Si no es una confirmación, asumir que el usuario ingresó un nuevo nombre
                        chatState.userData.fullName = msgText;
                        await message.reply(
                            "¿Confirma que este es su nombre correcto? Responda con *Si*, o escriba el nombre correcto nuevamente."
                        );
                        chatState.stage = 3; // Mantener el mismo estado para volver a validar
                    }
                    break;
                case 3.1:
                    try {
                        const user = await getUserByPhoneNumber(phone);

                        if (!user.isBotTalking) {
                            // Reiniciar el estado del bot
                            chatState.stage = 0;
                            chatState.talkToAgent = false;
                            chatState.greeted = false;

                            // Informar al cliente de que puede continuar con el bot
                            await message.reply(
                                "¡Hola de nuevo! 😊\n" +
                                    "Soy tu asistente virtual. Espero que nuestro agente haya podido resolver todas tus dudas de manera satisfactoria. Si necesitas algo más, no dudes en decírmelo. ¡Estoy aquí para ayudarte! 💬 \n\n" +
                                    "Por favor selecciona una opción del menú:\n\n" +
                                    Menu
                            );
                        } else {
                            console.log(
                                "El agente sigue hablando con el cliente."
                            );

                            let chatData = {
                                userId: user.id,
                                agentId:
                                    chatState.chat?.chat?.dataValues?.agentId ||
                                    null,
                            };
                            let initialMessageData = {
                                senderId: user.id,
                                content: msgText,
                                message: msgText,
                            };

                            const chat = await handleCreateChatWitMessage(
                                chatData,
                                initialMessageData
                            );
                            chatState.chat = chat;
                            //console.log(chatState.chat.chat.dataValues);
                            if (chatState.chat.chat.dataValues.agentId) {
                                await sendNotification(
                                    chatState.chat.chat.dataValues.agentId,
                                    "new_message",
                                    { chat: chatState.chat, msgText }
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            "Error al verificar el estado de isBotTalking:",
                            error
                        );
                    }
                    break;
            }
        } catch (error) {
            console.error("Error al procesar el mensaje:", error);
        }
    });

    client.initialize();
    clientInstance = client;
};

// Llamar a la función para iniciar el cliente
initializeClient();

const Reservations = require("../models/reservations.models");
const {
    sendNotification,
} = require("../notifications/notifications.controllers");
const { type } = require("os");

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

    const response = `Usted seleccionó: Habitación ${selectedRoom.type} con un costo de ${selectedRoom.pricePerNight}. \n escriba *si*, si esta de acuerdo con la seleccion o *no* para seleccionar otra opción`;

    await message.reply(response);
    chatState.stage = 2.4;
};

const handleConfirmReservation = async (msgText, message, chatState) => {
    const confirmation = msgText.toLowerCase();
    if (confirmation === "si") {
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
        const roomOptions = chatState.roomOptions
            .map((room, index) => {
                return `${index + 1}. ${room.type} - $${
                    room.pricePerNight
                } por noche`;
            })
            .join("\n");

        await message.reply("elija una de estas opciones?\n\n" + roomOptions);

        //se nececita cambiar este estado
        chatState.stage = 2.3;
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
        chatState.greeted = null;
    } catch (error) {
        console.error("Error al manejar el archivo:", error);
        await message.reply(
            "Ocurrió un error al procesar el archivo. Intenta nuevamente."
        );
    }
};

const getClient = () => {
    if (!clientInstance) {
        throw new Error("El cliente de WhatsApp no está inicializado.");
    }
    if (!isClientReady) {
        throw new Error("El cliente de WhatsApp no está listo.");
    }
    return clientInstance;
};

module.exports = {
    initializeClient,
    getClient,
};
