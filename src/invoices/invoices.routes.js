// routes/invoices.routes.js
const router = require("express").Router();
const invoicesController = require("./invoices.controllers");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware");
require("../middlewares/auth.middleware")(passport);

router.get("/", invoicesController.getAllInvoices);
router.get("/:id", invoicesController.getInvoiceById);

router.post(
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
    ]),
    invoicesController.createInvoice
);
router.put("/:id", invoicesController.updateInvoice);
router.delete("/:id", invoicesController.deleteInvoice);

module.exports = router;
