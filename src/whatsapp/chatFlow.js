const {
    createNotification,
} = require("../notifications/notifications.controllers");
const { getUsersByRole } = require("../users/users.controllers");

let io; // Variable para almacenar la instancia de Socket.IO
const humanSupportQueue = [];

// Configurar la instancia de io
const setIoInstance = (socketIoInstance) => {
    io = socketIoInstance;
};

const handleUserMessage = async (message, chatState, phone) => {
    // chatState.stage = 0;
    // chatState.greeted = true;
    // chatState.talkToAgent = true;

    // Llamamos a la función para obtener los usuarios administradores
    const adminUsers = await getUsersByRole("Administrator");

    // Creamos la notificación para cada uno de los administradores
    for (const user of adminUsers) {
        await createNotification({
            title: "notificación de prueba",
            message: message, // Usamos el mensaje recibido
            content: `${phone} pide hablar con un representante`, // Asumiendo que el tipo de la notificación es "new_message"
            type: "user_request_agent",
            status: "unread", // Asumimos que el estado de la notificación es "unread"
            userId: user.id, // Asignamos el ID del usuario al que va dirigida la notificación
        });
    }

    // Emitir evento a través de Socket.IO al frontend
    if (io) {
        io.emit("new-notification", {
            phone: phone,
            chatId: message.id,
            userName: message.notifyName || "Usuario sin nombre",
        });
        console.log("Evento emitido a través de Socket.IO");
    } else {
        console.error("Socket.IO no está disponible.");
    }
};

// Función para agregar al usuario a la cola y emitir evento de soporte
const handleHumanSupportRequest = async (message, chatState, phone) => {
    await message.reply(
        "Te pondremos en contacto con un representante humano. Por favor, espera un momento."
    );

    // Agregar al usuario a la cola de atención humana
    humanSupportQueue.push({
        phone: phone,
        chatId: message.id,
        userName: message.notifyName || "Usuario sin nombre",
    });

    // // Emitir evento a través de Socket.IO al frontend
    // if (io) {
    //     io.emit("new-notification", {
    //         phone: phone,
    //         chatId: message.id,
    //         userName: message.notifyName || "Usuario sin nombre",
    //     });
    //     console.log("Evento emitido a través de Socket.IO");
    // } else {
    //     console.error("Socket.IO no está disponible.");
    // }

    waitAgentMessage(message, chatState, phone);
};

// Función para escuchar los mensajes de los agentes en el frontend
const waitAgentMessage = async (message, chatState, phone) => {
    if (io) {
        console.log(
            "Conexión a IO confirmada, esperando respuesta del agente dentro de chat flow"
        );

        io.on("agent-response", async (data) => {
            const { chatId, message, phone } = data;
            console.log(`Mensaje de agente recibido: ${message}`);

            const user = humanSupportQueue.find(
                (item) => item.chatId === chatId
            );
            if (user) {
                await message.reply(message); // Asegúrate de que `message.reply` esté disponible
                console.log(`Mensaje enviado al cliente: ${message}`);
            } else {
                console.log("Usuario no encontrado en la cola");
            }
        });
    }
};

module.exports = { handleUserMessage, setIoInstance, waitAgentMessage };
