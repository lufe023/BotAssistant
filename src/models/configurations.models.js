// models/configurations.models.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Configurations = sequelize.define("configurations", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // Información general del negocio
    businessName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    slogan: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    logoUrl: {
        type: DataTypes.STRING, // URL al logo del negocio
        allowNull: true,
    },
    contactEmail: {
        type: DataTypes.STRING, // Correo oficial del negocio
        allowNull: true,
    },
    contactPhone: {
        type: DataTypes.STRING, // Teléfono de contacto
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING, // Dirección física del negocio
        allowNull: true,
    },

    // Configuración para el hotel
    defaultCheckInTime: {
        type: DataTypes.STRING, // Ejemplo: "14:00:00"
        allowNull: true,
        defaultValue: "14:00:00",
    },
    defaultCheckOutTime: {
        type: DataTypes.STRING, // Ejemplo: "12:00:00"
        allowNull: true,
        defaultValue: "12:00:00",
    },
    maxGuestsPerRoom: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 2,
    },

    // Configuración para el restaurante
    kitchenOpenTime: {
        type: DataTypes.STRING, // Ejemplo: "08:00:00"
        allowNull: true,
        defaultValue: "08:00:00",
    },
    kitchenCloseTime: {
        type: DataTypes.STRING, // Ejemplo: "22:00:00"
        allowNull: true,
        defaultValue: "22:00:00",
    },
    currency: {
        type: DataTypes.STRING, // Ejemplo: "USD", "EUR", "DOP"
        allowNull: true,
        defaultValue: "USD",
    },
    taxRate: {
        type: DataTypes.FLOAT, // Porcentaje de impuesto, ejemplo: 18.00
        allowNull: true,
        defaultValue: 0.0,
    },

    // Configuración para el bot de WhatsApp
    whatsappNumber: {
        type: DataTypes.STRING, // Número vinculado al bot
        allowNull: true,
    },
    whatsappWelcomeMessage: {
        type: DataTypes.TEXT, // Mensaje de bienvenida del bot
        allowNull: true,
    },
    whatsappBusinessHoursMessage: {
        type: DataTypes.TEXT, // Mensaje fuera del horario laboral
        allowNull: true,
    },
    whatsappBusinessHours: {
        type: DataTypes.JSON, // Ejemplo: { start: "08:00", end: "20:00" }
        allowNull: true,
    },

    // Configuración de usuarios y autenticación
    maxLoginAttempts: {
        type: DataTypes.INTEGER, // Intentos máximos de inicio de sesión
        allowNull: true,
        defaultValue: 5,
    },
    passwordResetExpiration: {
        type: DataTypes.INTEGER, // Minutos para expirar token de reseteo
        allowNull: true,
        defaultValue: 60,
    },

    // Configuración de otros aspectos generales
    timezone: {
        type: DataTypes.STRING, // Zona horaria del sistema
        allowNull: true,
        defaultValue: "UTC",
    },
    language: {
        type: DataTypes.STRING, // Idioma principal del sistema, ej: "es" o "en"
        allowNull: true,
        defaultValue: "es",
    },
    enableNotifications: {
        type: DataTypes.BOOLEAN, // Activar/desactivar notificaciones
        allowNull: true,
        defaultValue: true,
    },
    maintenanceMode: {
        type: DataTypes.BOOLEAN, // Modo de mantenimiento del sistema
        allowNull: true,
        defaultValue: false,
    },
});

module.exports = Configurations;
