const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            url: {
                type: String,
                default: "https://placehold.co/900x600?text=StayNest"
            },
            filename: {
                type: String,
                default: "listingimage"
            }
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        location: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review"
            }
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        category: {
            type: String,
            enum: [
                "Trending",
                "Rooms",
                "Cities",
                "Mountains",
                "Castles",
                "Pools",
                "Camping",
                "Farms",
                "Arctic",
                "Domes",
                "Boats"
            ],
            required: true
        }
    },
    {
        timestamps: true
    }
);

listingSchema.post("findOneAndDelete", async function (listing) {
    if (listing?.reviews?.length) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

module.exports = mongoose.model("Listing", listingSchema);