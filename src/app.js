//? Dependencies
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./utils/passport");
const db = require("./utils/database");
const fs = require("fs");

//? Files
const { port } = require("./config");
//* Routes
const userRouter = require("./users/users.router");
const authRouter = require("./auth/auth.router");
const whatsappRouter = require("./whatsapp/whatsapp.router");
const imagesRouter = require("./images/images.router");
const roomsRouter = require("./rooms/rooms.router");
const reservationsRouter = require("./reservations/reservations.router");
const summaryRouter = require("./summary/summary.router");

const initModels = require("./models/initModels");
const path = require("path");

//? Initial Configs
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

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
db.sync({ alter: false })
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

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/whatsapp", whatsappRouter);
app.use("/api/v1/images", imagesRouter);
app.use("/api/v1/rooms", roomsRouter);
app.use("/api/v1/reservations", reservationsRouter);
app.use("/api/v1/summary", summaryRouter);
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

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});

/**/
