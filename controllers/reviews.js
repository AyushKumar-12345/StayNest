const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "The listing you requested does not exist.");
            return res.redirect("/listings");
        }

        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;

        listing.reviews.push(newReview._id);

        await Promise.all([newReview.save(), listing.save()]);

        req.flash("success", "Review added successfully!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};

module.exports.destroyReview = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;

        const [listing, deletedReview] = await Promise.all([
            Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }),
            Review.findByIdAndDelete(reviewId)
        ]);

        if (!listing) {
            req.flash("error", "The listing you requested does not exist.");
            return res.redirect("/listings");
        }

        req.flash("success", "Review deleted successfully!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};