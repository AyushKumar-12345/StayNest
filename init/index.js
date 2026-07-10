const path = require("path");
// Point explicitly to the root directory where your .env file lives
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

const MONGO_URL = process.env.ATLASDB_URL;
const DEFAULT_OWNER = process.env.DEFAULT_OWNER;

if (!MONGO_URL) {
    throw new Error("ATLASDB_URL is not defined in .env");
}

if (!DEFAULT_OWNER) {
    throw new Error("DEFAULT_OWNER is not defined in .env");
}

// Ensure the hex string format is converted into a real native MongoDB ObjectId instance
if (!mongoose.Types.ObjectId.isValid(DEFAULT_OWNER)) {
    throw new Error("The DEFAULT_OWNER value inside your .env file is not a valid 24-character hexadecimal ObjectId.");
}
const objectIdOwner = new mongoose.Types.ObjectId(DEFAULT_OWNER);

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB Atlas");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
}

async function initDB() {
    try {
        // Clear old database documents
        await Listing.deleteMany({});

        // Map and clean listings with real owners and clean image structure
        const listings = initData.data.map((listing) => ({
            ...listing,
            owner: objectIdOwner,
            image: {
                url: listing.image.url,
                filename: listing.image.filename || "listingimage"
            }
        }));

        await Listing.insertMany(listings);
        console.log(`${listings.length} premium listings initialized successfully across all structural categories.`);
    } catch (err) {
        console.error("Error seeding the database:", err);
        throw err;
    }
}

(async () => {
    try {
        await connectDB();
        await initDB();
    } catch (err) {
        console.error("Initialization Failed:", err);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed cleanly.");
    }
})();