const { DataTypes } = require("sequelize");
const db = require("../utils/database");

const Orders = db.define("orders", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
    },
    customerType: {
        type: DataTypes.ENUM("table", "delivery", "takeaway", "bot_order"),
        allowNull: false,
    },
    assignedTable: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Número de mesa si aplica",
    },
    customer: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "Detalles del cliente si aplica",
    },
});

module.exports = Orders;
