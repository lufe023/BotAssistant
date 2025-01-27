const express = require("express");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware");
const areasServices = require("./areas.services");

const router = express.Router();

router.get("/", areasServices.getAllAreasService);
router.get("/:id", areasServices.getAreaByIdService);
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    areasServices.createNewAreaService
);
router.patch(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    areasServices.updateAreaService
);
router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    areasServices.deleteAreaService
);

module.exports = router;
