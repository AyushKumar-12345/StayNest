const Listing = require("../models/listing");
const Order = require("../models/order");

module.exports.index = async (req, res, next) => {
    try {
        const { search, category } = req.query;
        const query = {};

        if (search && search.trim() !== "") {
            const searchRegex = { $regex: search.trim(), $options: "i" };
            query.$or = [
                { title: searchRegex },
                { location: searchRegex },
                { country: searchRegex }
            ];
        }

        if (category && category.trim() !== "") {
            query.category = category.trim();
        }

        const allListings = await Listing.find(query);
        res.render("listings/index.ejs", { 
            allListings, 
            searchQuery: search || "",
            selectedCategory: category || ""
        });
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

        const bookedOrders = await Order.find({
            listing: id,
            status: "Paid"
        }).select("checkIn checkOut");

        const bookedDateRanges = bookedOrders.map(order => ({
            from: order.checkIn.toISOString().split("T")[0],
            to: order.checkOut.toISOString().split("T")[0]
        }));

        res.render("listings/show.ejs", { listing, bookedDateRanges });
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

        // AI Descriptive: If description is omitted, auto-generate with AI
        if (!newListing.description || newListing.description.trim() === "") {
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (apiKey) {
                    const { GoogleGenAI } = require("@google/genai");
                    const ai = new GoogleGenAI({ apiKey });
                    const prompt = `Write an enticing, elegant, and professional 3-4 sentence property description for a vacation rental listing named "${newListing.title}" located in ${newListing.location}, ${newListing.country} under the category "${newListing.category}". Highlight comfort, surroundings, and vibes. Do not include markdown headers or bullet points.`;
                    const resAi = await ai.models.generateContent({
                        model: "gemini-3.5-flash",
                        contents: prompt
                    });
                    if (resAi && resAi.text) {
                        newListing.description = resAi.text.trim();
                    }
                }
            } catch (aiErr) {
                console.warn("Server AI description fallback triggered:", aiErr.message);
            }

            // Reliable fallback if API was unavailable
            if (!newListing.description || newListing.description.trim() === "") {
                newListing.description = `Welcome to ${newListing.title}, a beautiful ${newListing.category} retreat located in ${newListing.location}, ${newListing.country}. Offering comfort, great views, and a relaxing atmosphere, this property is perfect for an unforgettable getaway.`;
            }
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