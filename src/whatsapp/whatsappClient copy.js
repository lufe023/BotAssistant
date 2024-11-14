const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const path = require("path");
const fs = require("fs-extra");
const { deleteQrImage } = require("../images/images.controller");
const {
    getUserByPhoneNumber,
    createUser,
} = require("../users/users.controllers");
const {
    getAvailableDates,
} = require("../reservations/reservations.controllers");

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

// Función para reiniciar el cliente de WhatsApp en caso de error
const initializeClient = () => {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
    });

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

            if (!chatStates[chatId]) {
                chatStates[chatId] = { stage: 0, greeted: false, userData: {} };
            }
            const chatState = chatStates[chatId];

            if (chatState.stage === 0 && !chatState.greeted) {
                const user = await getUserByPhoneNumber(phone);

                if (user) {
                    await message.reply(
                        `¡Hola ${user.firstName}! Bienvenido de nuevo. ¿En qué puedo ayudarte hoy?\n\n` +
                            "1️⃣ Consultar Disponibilidad.\n" +
                            "2️⃣ Hacer Reservación.\n" +
                            "3️⃣ Chatear con un Humano."
                    );
                    chatState.stage = 1;
                } else {
                    await message.reply(
                        "¡Hola! Soy el bot Asistente del Hotel y Restaurant Las Marias. 🤖 Necesito registrarte en nuestro sistema. Por favor, envíame tu nombre completo."
                    );
                    chatState.stage = 1.1;
                }
                chatState.greeted = true;
            }

            // Manejo del flujo de conversación según el estado actual
            switch (chatState.stage) {
                case 1.1: // Solicitar el nombre completo para el registro
                    chatState.userData.fullName = msgText;
                    await message.reply(
                        "Gracias. Ahora, ¿puedes enviarme tu apellido?"
                    );
                    chatState.stage = 1.2;
                    break;

                case 1.2: // Recibir apellido
                    chatState.userData.lastName = msgText;
                    await message.reply(
                        "Perfecto. Ahora, ¿cuál es tu número de teléfono?"
                    );
                    chatState.stage = 1.3;
                    break;

                case 1.3: // Registrar usuario después de recibir el teléfono
                    chatState.userData.phone = phone;
                    await createUser({
                        firstName: chatState.userData.fullName,
                        lastName: chatState.userData.lastName,
                        phone: chatState.userData.phone,
                    });
                    await message.reply(
                        "¡Registro completo! ¿En qué puedo ayudarte hoy?\n\n" +
                            "1️⃣ Consultar Disponibilidad.\n" +
                            "2️⃣ Hacer Reservación.\n" +
                            "3️⃣ Chatear con un Humano."
                    );
                    chatState.stage = 1;
                    break;

                case 1: // Menú de opciones
                    if (msgText === "1") {
                        await message.reply(
                            "Por favor, indícame la fecha de entrada y salida en formato DD/MM/AA."
                        );
                        chatState.stage = 2.1;
                    } else if (msgText === "2") {
                        await message.reply(
                            "Para realizar una reservación, necesito saber la fecha de entrada y salida en formato DD/MM/AA."
                        );
                        chatState.stage = 2.2;
                    } else if (msgText === "3") {
                        await message.reply(
                            "Te pondremos en contacto con un representante humano. Por favor, espera un momento."
                        );
                        chatState.stage = 0; // Reinicia para próximas interacciones
                    } else {
                        await message.reply(
                            "Opción no válida. Por favor, elige un número de la lista:\n\n" +
                                "1️⃣ Consultar Disponibilidad.\n" +
                                "2️⃣ Hacer Reservación.\n" +
                                "3️⃣ Chatear con un Humano."
                        );
                    }
                    break;

                case 2.1: // Consultar disponibilidad
                    const [startDate, endDate] = msgText.split(" "); // Usuario envía ambas fechas separadas por un espacio
                    if (startDate && endDate) {
                        const availableDates = await getAvailableDates(
                            startDate,
                            endDate
                        );
                        await message.reply(
                            `Fechas disponibles:\n${availableDates
                                .map((date) => `- ${date}`)
                                .join("\n")}`
                        );
                        chatState.stage = 1;
                    } else {
                        await message.reply(
                            "Por favor, envíame ambas fechas en formato DD/MM/AA."
                        );
                    }
                    break;

                case 2.2: // Realizar una reservación
                    const [reservationStart, reservationEnd] =
                        msgText.split(" ");
                    if (reservationStart && reservationEnd) {
                        // Lógica para realizar reservación
                        await message.reply(
                            `Tu reservación está en proceso para las fechas:\nEntrada: ${reservationStart}\nSalida: ${reservationEnd}`
                        );
                        chatState.stage = 1;
                    } else {
                        await message.reply(
                            "Por favor, envíame ambas fechas en formato DD/MM/AA."
                        );
                    }
                    break;
            }
        } catch (error) {
            console.error("Error al manejar el mensaje:", error);
        }
    });

    client.initialize().catch((error) => {
        console.error("Error en la inicialización del cliente:", error);
        setTimeout(initializeClient, 5000);
    });

    return client;
};

initializeClient();

module.exports = initializeClient;
