//? Dependencies
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./utils/passport");
const db = require("./utils/database");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const chatFlow = require("./whatsapp/chatFlow");
const notificationsControllers = require("./notifications/notifications.controllers");
const jwt = require("jsonwebtoken");
const chatServices = require("./chats/chats.controllers");

//? Files
const { port, jwtSecret } = require("./config");
//* Routes
const userRouter = require("./users/users.router");
const authRouter = require("./auth/auth.router");
const whatsappRouter = require("./whatsapp/whatsapp.router");
const imagesRouter = require("./images/images.router");
const roomsRouter = require("./rooms/rooms.router");
const reservationsRouter = require("./reservations/reservations.router");
const summaryRouter = require("./summary/summary.router");
const galleryImagesRoutes = require("./galleryImages/galleryImages.routes");
const galleriesRoutes = require("./galleries/galleries.routes");
const notificationsRouter = require("./notifications/notifications.router");
const chatsRouter = require("./chats/chats.routes");
const issueRouter = require("./roomIssues/roomIssues.router");
const cleaningRouter = require("./roomCleaning/roomCleanings.routes");

const initModels = require("./models/initModels");
const path = require("path");

//? Initial Configs
const app = express();

// Configurar CORS para permitir solicitudes desde localhost:5173
app.use(
    cors({
        origin: "*",
        methods: "*", //["GET", "POST", "PUT", "PATH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

notificationsControllers.setIoInstance(io);

io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Manejar autenticación
    socket.on("authenticate", (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            if (userId) {
                notificationsControllers.setNotificationsUsers(
                    userId,
                    socket.id
                );
                console.log(
                    `Usuario autenticado: ${userId}, socket: ${socket.id}`
                );
            }
        } catch (error) {
            console.error("Error al autenticar:", error.message);
        }
    });

    // Manejar desconexión
    socket.on("disconnect", () => {
        console.log(`Socket desconectado: ${socket.id}`);

        const userId = [
            ...notificationsControllers.connectedUsers.entries(),
        ].find(([, sockets]) => sockets.has(socket.id))?.[0];

        if (userId) {
            notificationsControllers.removeNotificationSocket(
                userId,
                socket.id
            );
        }
    });
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 9000;

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor Express y Socket.io corriendo en el puerto ${PORT}`);
});

app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

db.authenticate()
    .then(() => {
        console.log("Database Authenticated");
    })
    .catch((err) => {
        console.log(err);
    });

// db.sync({ alter: true })
db.sync({ alter: true })
    .then(() => {
        console.log("Database Synced");
    })
    .catch((err) => {
        console.log(err);
    });

initModels();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Middleware para servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/whatsapp", whatsappRouter);
app.use("/api/v1/images", imagesRouter);
app.use("/api/v1/rooms", roomsRouter);
app.use("/api/v1/reservations", reservationsRouter);
app.use("/api/v1/summary", summaryRouter);
app.use("/api/v1/galleries", galleriesRoutes);
app.use("/api/v1/gallery-images", galleryImagesRoutes);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/chats", chatsRouter);
app.use("/api/v1/issues", issueRouter);
app.use("/api/v1/cleanings", cleaningRouter);

// Endpoint para generar la colección de Postman
app.get("/api/v1/generate-postman-collection", (req, res) => {
    const collection = {
        info: {
            name: "Hotel Asistant Bot System",
            description:
                "This is an automatically generated Postman collection",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        host: `localhost`,
        item: [],
    };

    // Agrupamos las rutas por servicios
    const groupedRoutes = {
        users: [],
        auth: [],
        rooms: [],
        reservations: [],
        summary: [],
    };

    // Función para extraer el último segmento del path
    const getLastPathSegment = (path) => {
        const segments = path.split("/").filter((part) => part !== "");
        return segments[segments.length - 1]; // Último segmento de la ruta
    };

    // Función para agregar rutas a la colección
    const addRouteToCollection = (method, path, requiresAuth) => {
        const fullPath = `${collection.host}${path}`;
        const request = {
            method,
            url: {
                raw: fullPath,
                protocol: "http",
                host: [collection.host],
                port: port.toString(),
                path: path.split("/").filter((part) => part !== ""),
            },
        };

        // Si se requiere autenticación, agregar el encabezado Authorization
        if (requiresAuth) {
            request.header = [
                {
                    key: "Authorization",
                    value: "jwt {{token}}", // Aquí se añade el encabezado Authorization
                },
            ];
        }

        // Usamos solo la última parte de la ruta como nombre
        return {
            name: getLastPathSegment(path), // Aquí simplificamos el nombre
            request,
        };
    };

    // Recolectar las rutas de los routers
    const routers = [
        { basePath: "/api/v1/users", router: userRouter },
        { basePath: "/api/v1/auth", router: authRouter },
        { basePath: "/api/v1/rooms", router: roomsRouter },
        { basePath: "/api/v1/reservations", router: reservationsRouter },
        { basePath: "/api/v1/summary", router: summaryRouter },
    ];

    routers.forEach(({ basePath, router }) => {
        router.stack.forEach((layer) => {
            if (layer.route) {
                const method = Object.keys(layer.route.methods)[0];
                const path = layer.route.path;

                // Verifica si el endpoint requiere autenticación
                const requiresAuth = layer.route.stack.some(
                    (stackLayer) => stackLayer.handle.name === "authenticate" // Cambia esto si tu middleware tiene un nombre diferente
                );

                groupedRoutes[basePath.split("/")[3]].push(
                    addRouteToCollection(
                        method,
                        `${basePath}${path}`,
                        requiresAuth
                    )
                ); // Usar basePath + path aquí
            } else if (layer.handle && layer.handle.stack) {
                layer.handle.stack.forEach((subLayer) => {
                    if (subLayer.route) {
                        const method = Object.keys(subLayer.route.methods)[0];
                        const path = subLayer.route.path;

                        // Verifica si el endpoint requiere autenticación
                        const requiresAuth = subLayer.route.stack.some(
                            (stackLayer) =>
                                stackLayer.handle.name === "authenticate" // Cambia esto si tu middleware tiene un nombre diferente
                        );

                        groupedRoutes[basePath.split("/")[3]].push(
                            addRouteToCollection(
                                method,
                                `${basePath}${path}`,
                                requiresAuth
                            ) // Usar basePath + path aquí
                        );
                    }
                });
            }
        });
    });

    // Añadimos los elementos a la colección de Postman
    Object.keys(groupedRoutes).forEach((service) => {
        const serviceItems = groupedRoutes[service];

        if (serviceItems.length > 0) {
            const serviceGroup = {
                name: service.charAt(0).toUpperCase() + service.slice(1),
                item: serviceItems,
            };

            collection.item.push(serviceGroup);
        }
    });

    // Guardamos la colección en un archivo (opcional)
    fs.writeFileSync(
        "postman_collection.json",
        JSON.stringify(collection, null, 2)
    );

    res.json(collection);
});
