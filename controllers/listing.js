const Listing = require("../models/listing");

module.exports.index = async (req, res, next) => {
    try {
        const { search, category } = req.query;
        const query = {};

        if (search) {
            const searchRegex = { $regex: search, $options: "i" };
            query.$or = [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex }
            ];
        }

        if (category) {
            query.category = category;
        }

        const allListings = await Listing.find(query);
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        next(err);
    }
};

module.exports.renderNewform = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" }
            })
            .populate("owner");

        if (!listing) {
            req.flash("error", "The listing you requested does not exist.");
            return res.redirect("/listings");
        }

        if (!listing.owner) {
            listing.owner = {
                _id: "000000000000000000000000",
                email: "admin@staynest.com"
            };
        }

        res.render("listings/show.ejs", { listing });
    } catch (err) {
        next(err);
    }
};

module.exports.createListing = async (req, res, next) => {
    try {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await newListing.save();
        req.flash("success", "New listing created successfully!");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};

module.exports.renderEditform = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "The listing you requested does not exist.");
            return res.redirect("/listings");
        }

        const originalImageUrl = listing.image?.url 
            ? listing.image.url.replace("/upload", "/upload/w_250") 
            : "";

        res.render("listings/edit.ejs", { listing, originalImageUrl });
    } catch (err) {
        next(err);
    }
};

module.exports.updateListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body.listing };

        if (req.file) {
            updateData.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        const listing = await Listing.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!listing) {
            req.flash("error", "The listing you requested does not exist.");
            return res.redirect("/listings");
        }

        req.flash("success", "Listing updated successfully!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};

module.exports.destroyListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);

        if (!deletedListing) {
            req.flash("error", "The listing you requested does not exist.");
            return res.redirect("/listings");
        }

        req.flash("success", "Listing deleted successfully!");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};