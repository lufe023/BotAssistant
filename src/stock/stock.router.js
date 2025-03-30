const express = require("express");
const stockController = require("./stock.controller");
const roleValidate = require("../middlewares/role.middleware");
const passport = require("passport");
require("../middlewares/auth.middleware")(passport);
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

const router = express.Router();

router.get("/", auth, roleValidate(viewRoles), stockController.getAllStock);

router.get("/:id", auth, roleValidate(viewRoles), stockController.getStockById);

router.post("/", auth, roleValidate(modifyRoles), stockController.createStock);

router.put(
    "/:id",
    auth,
    roleValidate(modifyRoles),
    stockController.updateStock
);

router.delete(
    "/:id",
    auth,
    roleValidate(["Administrator", "gerente", "supervisor"]),
    stockController.deleteStock
);

module.exports = router;
