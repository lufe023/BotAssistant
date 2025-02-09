const express = require("express");
const router = express.Router();
const configurationsController = require("./configurations.controller");

router.get("/siteInformation/:id", configurationsController.getSiteInfo);

router.get("/:id", configurationsController.getConfigurationsById);

router.get("/", configurationsController.getConfigurations);
router.post("/", configurationsController.createConfiguration);
router.put("/:id", configurationsController.updateConfiguration);
router.delete("/:id", configurationsController.deleteConfiguration);

module.exports = router;
