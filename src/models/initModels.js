const Users = require("./users.models");
const Roles = require("./roles.models");
const Reservations = require("./reservations.models");
const Rooms = require("./rooms.models");
const Galleries = require("./galleries.models");
const GalleryImages = require("./galleryImages.models");
const RoomIssues = require("./room_issues.models");
const Chats = require("./chats.models");
const Messages = require("./messages.models");
const Notifications = require("./notifications.models");
const configurations = require("./configurations.models");
const RoomCleanings = require("./roomCleanings");
const Areas = require("./areas.models");
const Invoices = require("./invoice.models");
const InvoiceDetail = require("./invoiceDetail.models");
const Items = require("./items.models");
const OrderStatusTracking = require("./OrderStatusTracking");
const FavoriteItems = require("./favorIteItems.models");
const Stock = require("./stock.models");
const Department = require("./deparment.models");
const inventoryHistory = require("./inventoryHistory.models");

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
    Reservations.belongsTo(Users, { as: "guest", foreignKey: "userId" });
    Users.hasMany(Reservations, { foreignKey: "userId" });

    // Relación entre Habitaciones y Reservaciones
    Rooms.hasMany(Reservations, { foreignKey: "roomId" });
    Reservations.belongsTo(Rooms, { foreignKey: "roomId" });

    // Relación entre Habitaciones y problemas
    Rooms.hasMany(RoomIssues, { foreignKey: "roomId" });
    RoomIssues.belongsTo(Rooms, { foreignKey: "roomId" });

    Rooms.hasOne(Areas, {
        foreignKey: "id",
        sourceKey: "ubication",
        as: "areas",
    });
    Areas.belongsTo(Rooms, { foreignKey: "ubication", as: "room" });

    // Relación entre Items y Reservaciones
    Items.belongsTo(Reservations, { foreignKey: "reservationId" });
    Reservations.hasMany(Items, { foreignKey: "reservationId" });

    Reservations.belongsTo(Rooms, { foreignKey: "roomId", as: "Room" });
    Rooms.hasMany(Reservations, { foreignKey: "roomId", as: "Reservations" });

    Chats.belongsTo(Users, { as: "user", foreignKey: "userId" });
    Chats.belongsTo(Users, { as: "agent", foreignKey: "agentId" });
    Chats.hasMany(Messages, { as: "messages", foreignKey: "chatId" });

    Messages.belongsTo(Chats, { foreignKey: "chatId" });
    Messages.belongsTo(Users, { as: "sender", foreignKey: "senderId" });

    // Relación de Rooms con RoomCleanings
    Rooms.hasMany(RoomCleanings, { foreignKey: "roomId" });
    RoomCleanings.belongsTo(Rooms, { foreignKey: "roomId" });

    // Relación de Users con RoomCleanings
    Users.hasMany(RoomCleanings, { foreignKey: "userId" });
    RoomCleanings.belongsTo(Users, { as: "cleanedBy", foreignKey: "userId" });

    Notifications.belongsTo(Users, { foreignKey: "userId" });

    // Relación entre Usuarios y Facturas
    Invoices.belongsTo(Users, { foreignKey: "userId", as: "debtor" });
    Invoices.belongsTo(Users, { foreignKey: "vendorId", as: "vendor" });
    Users.hasMany(Invoices, { foreignKey: "userId" });

    // Relación entre Factura y Detalles de Factura
    Invoices.hasMany(InvoiceDetail, { foreignKey: "invoiceId" });
    InvoiceDetail.belongsTo(Invoices, { foreignKey: "invoiceId" });

    // Relación entre Detalles de Factura e Items
    InvoiceDetail.belongsTo(Items, { foreignKey: "itemId" });
    Items.hasMany(InvoiceDetail, { foreignKey: "itemId" });

    InvoiceDetail.hasMany(OrderStatusTracking, { foreignKey: "orderId" });
    OrderStatusTracking.belongsTo(InvoiceDetail, { foreignKey: "orderId" });

    // En el modelo Users
    Users.hasMany(FavoriteItems, { foreignKey: "userId" });
    FavoriteItems.belongsTo(Users, { foreignKey: "userId" });

    // En el modelo Items
    Items.hasMany(FavoriteItems, { foreignKey: "itemId" });
    FavoriteItems.belongsTo(Items, { foreignKey: "itemId" });

    Stock.belongsTo(Items, { foreignKey: "itemId" });
    Stock.belongsTo(Department, { foreignKey: "departmentId" });

    Items.hasMany(Stock, { foreignKey: "itemId" });
    Department.hasMany(Stock, { foreignKey: "departmentId" });
};

module.exports = initModels;
