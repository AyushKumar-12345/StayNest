const express = require("express");
const multer = require("multer");
const router = express.Router();

const { storage } = require("../cloudconfig");
const upload = multer({ storage });

const wrapAsync = require("../utils/wrapAsync");
const listingController = require("../controllers/listing");

const {
    isLoggedIn,
    isOwner,
    validateListing
} = require("../middleware");

router.get(
    "/new",
    isLoggedIn,
    listingController.renderNewform
);

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditform)
);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );

module.exports = router;