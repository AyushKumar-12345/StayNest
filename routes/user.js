const express = require("express");
const passport = require("passport");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/user");

router
    .route("/signup")
    .get(userController.renderSignupform)
    .post(wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLoginform)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }),
        userController.login
    );

router.get(
    "/logout",
    userController.logout
);

module.exports = router;