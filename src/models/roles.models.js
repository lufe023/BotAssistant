const { DataTypes } = require("sequelize");
const db = require("../utils/database");

const Roles = db.define("user_roles", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    roleName: {
        type: DataTypes.ENUM,
        values: [
            "Administrator",
            "user",
            "guest",
            "camarero",
            "chef",
            "ayudante_cocina",
            "recepcionista",
            "gerente",
            "conserje",
            "bartender",
            "supervisor",
            "auxiliar",
            "cocinero",
            "administrativo",
            "auxiliar_administrativo",
            "mantenimiento",
            "seguridad",
        ],
        allowNull: true,
        field: "role_name",
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

// Sincronizar el modelo y agregar los datos predeterminados
Roles.sync({ force: false }).then(() => {
    // Insertar los roles predeterminados si no existen
    Roles.findAndCountAll().then((result) => {
        if (result.count === 0) {
            Roles.bulkCreate([
                { roleName: "Administrator", level: 1 },
                { roleName: "user", level: 2 },
                { roleName: "guest", level: 3 },
                { roleName: "camarero", level: 4 },
                { roleName: "chef", level: 5 },
                { roleName: "ayudante_cocina", level: 6 },
                { roleName: "recepcionista", level: 7 },
                { roleName: "gerente", level: 8 },
                { roleName: "conserje", level: 9 },
                { roleName: "bartender", level: 10 },
                { roleName: "supervisor", level: 11 },
                { roleName: "auxiliar", level: 12 },
                { roleName: "cocinero", level: 13 },
                { roleName: "administrativo", level: 14 },
                { roleName: "auxiliar_administrativo", level: 15 },
                { roleName: "mantenimiento", level: 16 },
                { roleName: "seguridad", level: 17 },
            ]);
        }
    });
});

module.exports = Roles;
