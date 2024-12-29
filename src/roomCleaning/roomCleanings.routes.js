const express = require("express");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware");
const cleaningsServices = require("./roomCleanings.services");

const router = express.Router();

router.get("/", cleaningsServices.getAllCleanings);
router.get("/:id", cleaningsServices.getCleaningById);
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    cleaningsServices.createCleaning
);
router.patch(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    cleaningsServices.updateCleaning
);
router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    cleaningsServices.deleteCleaning
);

module.exports = router;
