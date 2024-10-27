const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const path = require("path");
const fs = require("fs-extra");
const { deleteQrImage } = require("../images/images.controller");

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

    // Manejar el evento de QR
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

    // Capturar fallo de autenticación y reconectar
    client.on("auth_failure", (msg) => {
        console.error("Falló la autenticación: ", msg);
        initializeClient(); // Reinicia el cliente
    });

    // Captura de error de desconexión
    client.on("disconnected", (reason) => {
        console.error("Cliente desconectado:", reason);
        initializeClient(); // Reinicia el cliente en caso de desconexión
    });

    // Listener de mensajes
    const chatStates = {};

    client.on("message", async (message) => {
        try {
            const chatId = message.from;
            const msgText = message.body;

            // Inicializa el estado del chat si no existe
            if (!chatStates[chatId]) {
                chatStates[chatId] = { stage: 0 };
            }

            // Manejo del flujo de conversación
            switch (chatStates[chatId].stage) {
                case 0:
                    if (msgText.toLowerCase() != null) {
                        await message.reply(
                            "Saludos, soy el bot de MiElector y estoy aquí para ayudarte. 🤖\nElige un número de esta lista:\n\n" +
                                "1️⃣ Consultar Cédula.\n" +
                                "2️⃣ Recibir mi Padroncillo."
                        );
                        chatStates[chatId].stage = 1; // Avanza al siguiente estado
                    }
                    break;

                case 1:
                    if (msgText === "1") {
                        await message.reply(
                            "Indíqueme el número de cédula, por favor."
                        );
                        chatStates[chatId].stage = 2; // Avanza al estado de consulta de cédula
                    } else if (msgText === "2") {
                        await message.reply(
                            "Indíqueme el número de cédula, por favor."
                        );
                        chatStates[chatId].stage = 3; // Avanza al estado de Padroncillo
                    }
                    break;
            }
        } catch (error) {
            console.error("Error al manejar el mensaje:", error);
        }
    });

    // Inicializar el cliente
    client.initialize().catch((error) => {
        console.error("Error en la inicialización del cliente:", error);
        setTimeout(initializeClient, 5000); // Reinicia el cliente tras un breve tiempo
    });

    return client;
};

// Ejecutar la inicialización del cliente al iniciar el script
initializeClient();

module.exports = initializeClient;
