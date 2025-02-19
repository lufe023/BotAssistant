// routes/invoices.routes.js
const router = require("express").Router();
const invoicesController = require("./invoices.controllers");

router.get("/", invoicesController.getAllInvoices);
router.get("/:id", invoicesController.getInvoiceById);
router.post("/", invoicesController.createInvoice);
router.put("/:id", invoicesController.updateInvoice);
router.delete("/:id", invoicesController.deleteInvoice);

module.exports = router;
