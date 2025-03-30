// items.router.js
const express = require("express");
const router = express.Router();
const ItemsController = require("./items.controller");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware");

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate([
        "Administrator",
        "camarero",
        "chef",
        "ayudante_cocina",
        "recepcionista",
        "gerente",
        "bartender",
        "supervisor",
        "auxiliar",
        "cocinero",
        "administrativo",
        "auxiliar_administrativo",
    ]),
    ItemsController.getAllItems
);

router.get(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate([
        "Administrator",
        "camarero",
        "chef",
        "ayudante_cocina",
        "recepcionista",
        "gerente",
        "bartender",
        "supervisor",
        "auxiliar",
        "cocinero",
        "administrativo",
        "auxiliar_administrativo",
    ]),
    ItemsController.getItemById
);
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate([
        "Administrator",
        "chef",
        "gerente",
        "bartender",
        "supervisor",
        "auxiliar",
        "cocinero",
        "administrativo",
        "auxiliar_administrativo",
    ]),
    ItemsController.createItem
);
router.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate([
        "Administrator",
        "chef",
        "gerente",
        "bartender",
        "supervisor",
        "auxiliar",
        "cocinero",
        "administrativo",
        "auxiliar_administrativo",
    ]),
    ItemsController.updateItem
);
router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator", "gerente", "supervisor", "administrativo"]),
    ItemsController.deleteItem
);

//busqueda simple en tiempo real de personas
router.post(
    "/itemSearh",
    passport.authenticate("jwt", { session: false }),
    roleValidate([
        "Administrator",
        "camarero",
        "chef",
        "ayudante_cocina",
        "recepcionista",
        "gerente",
        "bartender",
        "supervisor",
        "auxiliar",
        "cocinero",
        "administrativo",
        "auxiliar_administrativo",
    ]),
    ItemsController.findItemOnTimeController
);
router.post(
    "/findBarcode",
    passport.authenticate("jwt", { session: false }),
    roleValidate([
        "Administrator",
        "camarero",
        "chef",
        "ayudante_cocina",
        "recepcionista",
        "gerente",
        "bartender",
        "supervisor",
        "auxiliar",
        "cocinero",
        "administrativo",
        "auxiliar_administrativo",
    ]),
    ItemsController.findItemByBarcodeController
);
module.exports = router;
