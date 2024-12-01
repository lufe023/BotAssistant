const express = require("express");
const router = express.Router();
const roomIssuesServices = require("./roomIssues.services");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware");

router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    roomIssuesServices.getAllRoomIssues
);

router.get(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator", "Client"]),
    roomIssuesServices.getRoomIssueById
);

router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator", "Client"]),
    roomIssuesServices.createRoomIssue
);

router.patch(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    roomIssuesServices.updateRoomIssue
);

router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    roomIssuesServices.deleteRoomIssue
);

module.exports = router;
