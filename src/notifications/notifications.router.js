const express = require("express");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware"); // Asegúrate de tener este middleware

const notificationsServices = require("./notifications.services");

const router = express.Router();

router.get("/", notificationsServices.getAllNotifications);
router.get(
    "/my",
    passport.authenticate("jwt", { session: false }),
    notificationsServices.getMyNotifications
);

router.get(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    notificationsServices.getNotificationById
);

router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    notificationsServices.createNotification
);

router.patch(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    notificationsServices.updateNotification
);

router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    roleValidate(["Administrator"]),
    notificationsServices.deleteNotification
);

module.exports = router;
