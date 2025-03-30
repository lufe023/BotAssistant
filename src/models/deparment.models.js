const db = require("../utils/database");
const { DataTypes } = require("sequelize");

const Department = db.define("department", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

Department.sync().then(() => {
    Department.findAndCountAll().then((result) => {
        if (result.count === 0) {
            Department.bulkCreate([
                {
                    name: "Sin departamento",
                    description: "Sin departamento no recomendado usar",
                },
            ]);
        }
    });
});
module.exports = Department;
