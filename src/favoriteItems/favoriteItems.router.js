const express = require("express");
const router = express.Router();
const FavoriteItemsController = require("./favoriteItems.controller");
const passport = require("passport");
const roleValidate = require("../middlewares/role.middleware");
require("../middlewares/auth.middleware")(passport);

router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    FavoriteItemsController.addFavoriteItem
);
router.delete(
    "/",
    passport.authenticate("jwt", { session: false }),
    FavoriteItemsController.removeFavoriteItem
);
router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    FavoriteItemsController.getFavoriteItemsByUser
);

module.exports = router;
