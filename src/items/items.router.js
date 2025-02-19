// items.router.js
const express = require("express");
const router = express.Router();
const ItemsController = require("./items.controller");

router.get("/", ItemsController.getAllItems);
router.get("/:id", ItemsController.getItemById);
router.post("/", ItemsController.createItem);
router.put("/:id", ItemsController.updateItem);
router.delete("/:id", ItemsController.deleteItem);
//busqueda simple en tiempo real de personas
router.post("/itemSearh", ItemsController.findItemOnTimeController);
router.post("/findBarcode", ItemsController.findItemByBarcodeController);
module.exports = router;
