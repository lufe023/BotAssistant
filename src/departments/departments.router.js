const router = require("express").Router();
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware");
const departmentControllers = require("./departments.controllers");

// Autenticación y autorización
const auth = passport.authenticate("jwt", { session: false });

// Definimos qué roles pueden acceder a cada endpoint
const viewRoles = [
    "Administrator",
    "gerente",
    "supervisor",
    "administrativo",
    "auxiliar_administrativo",
];
const modifyRoles = ["Administrator", "gerente", "supervisor"];

// Ruta raíz `/departments`
router
    .route("/")
    .get(auth, roleValidate(viewRoles), departmentControllers.getAllDepartments) // Obtener todos
    .post(
        auth,
        roleValidate(modifyRoles),
        departmentControllers.createDepartment
    ); // Crear

// Rutas dinámicas `/departments/:id`
router
    .route("/:id")
    .get(auth, roleValidate(viewRoles), departmentControllers.getDepartmentById) // Obtener por ID
    .patch(
        auth,
        roleValidate(modifyRoles),
        departmentControllers.updateDepartment
    ) // Actualizar
    .delete(
        auth,
        roleValidate(["Administrator"]),
        departmentControllers.deleteDepartment
    ); // Eliminar (Solo admin)

module.exports = router;
