//departments.controllers.js
const departmentServices = require("./departments.services");

/**
 * Controlador para obtener todos los departamentos.
 */
const getAllDepartments = async (req, res) => {
    try {
        const departments = await departmentServices.getAllDepartments();
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener departamentos",
            error,
        });
    }
};

/**
 * Controlador para obtener un departamento por ID.
 */
const getDepartmentById = async (req, res) => {
    try {
        const department = await departmentServices.getDepartmentById(
            req.params.id
        );
        if (!department)
            return res
                .status(404)
                .json({ message: "Departamento no encontrado" });

        res.status(200).json(department);
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener el departamento",
            error,
        });
    }
};

/**
 * Controlador para crear un nuevo departamento.
 */
const createDepartment = async (req, res) => {
    try {
        const department = await departmentServices.createDepartment(req.body);
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({
            message: "Error al crear el departamento",
            error,
        });
    }
};

/**
 * Controlador para actualizar un departamento.
 */
const updateDepartment = async (req, res) => {
    try {
        const updatedDepartment = await departmentServices.updateDepartment(
            req.params.id,
            req.body
        );
        if (!updatedDepartment)
            return res
                .status(404)
                .json({ message: "Departamento no encontrado" });

        res.status(200).json(updatedDepartment);
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar el departamento",
            error,
        });
    }
};

/**
 * Controlador para eliminar un departamento.
 */
const deleteDepartment = async (req, res) => {
    try {
        const deletedDepartment = await departmentServices.deleteDepartment(
            req.params.id
        );
        if (!deletedDepartment)
            return res
                .status(404)
                .json({ message: "Departamento no encontrado" });

        res.status(200).json({
            message: "Departamento eliminado correctamente",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al eliminar el departamento",
            error,
        });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};
