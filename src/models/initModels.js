const Users = require("./users.models");
const Roles = require("./roles.models");
const Reservations = require("./reservations.models");
const Rooms = require("./rooms.models");
const Payments = require("./payments.models");
const ServiceReservations = require("./serviceReservations.models");
const Services = require("./services.models");
const Galleries = require("./galleries.models");
const GalleryImages = require("./galleryImages.models");

const initModels = () => {
    // Relación entre Usuarios y Roles
    Users.belongsTo(Roles, { foreignKey: "role" });
    Roles.hasMany(Users, { foreignKey: "role" });

    // Relación entre Galerías e Imágenes de Galería
    Galleries.hasMany(GalleryImages, { foreignKey: "galleryId" });
    GalleryImages.belongsTo(Galleries, { foreignKey: "galleryId" });

    // Relación entre Habitaciones y Galerías
    Galleries.hasMany(Rooms, { foreignKey: "galleryId" });
    Rooms.belongsTo(Galleries, { foreignKey: "galleryId" });

    // Relación entre Usuarios y Reservaciones (antes Customers y Reservations)
    Users.hasMany(Reservations, { foreignKey: "userId" });
    Reservations.belongsTo(Users, { foreignKey: "userId" });

    // Relación entre Habitaciones y Reservaciones
    Rooms.hasMany(Reservations, { foreignKey: "roomId" });
    Reservations.belongsTo(Rooms, { foreignKey: "roomId" });

    // Relación entre Pagos y Reservaciones
    Reservations.hasMany(Payments, { foreignKey: "reservationId" });
    Payments.belongsTo(Reservations, { foreignKey: "reservationId" });

    // Relación entre Servicios y Reservaciones de Servicios
    Reservations.hasMany(ServiceReservations, { foreignKey: "reservationId" });
    ServiceReservations.belongsTo(Reservations, {
        foreignKey: "reservationId",
    });

    Services.hasMany(ServiceReservations, { foreignKey: "serviceId" });
    ServiceReservations.belongsTo(Services, { foreignKey: "serviceId" });

    Reservations.belongsTo(Rooms, { foreignKey: "roomId", as: "Room" });
    Rooms.hasMany(Reservations, { foreignKey: "roomId", as: "Reservations" });
};

module.exports = initModels;
