const db = require("../utils/database");
const { DataTypes } = require("sequelize");
const Reservations = require("./reservations.models");
const Services = require("./services.models");

const ServiceReservations = db.define("service_reservations", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
    },
    reservationId: {
        type: DataTypes.UUID,
        references: {
            model: Reservations,
            key: "id",
        },
    },
    serviceId: {
        type: DataTypes.UUID,
        references: {
            model: Services,
            key: "id",
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
});

module.exports = ServiceReservations;
