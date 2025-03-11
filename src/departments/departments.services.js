//departments.services.js

const Departments = require("../models/deparment.models");

const getAllDepartments = async () => {
    return await Departments.findAll();
};

const getDepartmentById = async (id) => {
    return await Departments.findByPk(id);
};

const createDepartment = async (data) => {
    return await Departments.create(data);
};

const updateDepartment = async (id, data) => {
    const department = await Departments.findByPk(id);
    if (!department) return null;
    await department.update(data);
    return department;
};

const deleteDepartment = async (id) => {
    const department = await Departments.findByPk(id);
    if (!department) return null;
    await department.destroy();
    return department;
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};
