if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const multer = require("multer");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");
const Listing = require("./models/listing");
const Order = require("./models/order");
const { isLoggedIn } = require("./middleware");
const { storage } = require("./cloudconfig");

const listingRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");

const app = express();
const upload = multer({ storage });

const PORT = process.env.PORT || 8080;
const dbUrl = process.env.ATLASDB_URL;
const sessionSecret = process.env.SECRET;

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials missing.");
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

if (!dbUrl) {
    throw new Error("ATLASDB_URL is not defined.");
}

if (!sessionSecret) {
    throw new Error("SECRET is not defined.");
}

async function connectDB() {
    try {
        await mongoose.connect(dbUrl);
        console.log("MongoDB connected successfully.");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
}

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: sessionSecret,
    },
    touchAfter: 24 * 60 * 60,
});

app.use(
    session({
        store,
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        },
    })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    res.locals.pageUrl = req.originalUrl;
    res.locals.razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    next();
});

// Main Feature Routers (Declared first to avoid route handling conflicts)
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// Base Static Navigation Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/privacy", (req, res) => {
    res.render("static/privacy.ejs");
});

app.get("/terms", (req, res) => {
    res.render("static/terms.ejs");
});

app.get("/contact", (req, res) => {
    res.render("static/contact.ejs");
});

app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        req.flash("error", "Please fill all contact details.");
        return res.redirect("/contact");
    }

    console.log("Contact Request:", { name, email, message });
    req.flash("success", "Your message has been received. We will contact you soon.");
    res.redirect("/contact");
});

// User Profile Routes
app.get("/profile", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.render("users/profile.ejs", { user });
    } catch (err) {
        next(err);
    }
});

app.post("/profile/update-avatar", isLoggedIn, upload.single("profileImage"), async (req, res, next) => {
    try {
        if (!req.file) {
            req.flash("error", "No image file uploaded.");
            return res.redirect("/profile");
        }

        await User.findByIdAndUpdate(req.user._id, {
            profileImage: {
                url: req.file.path,
                filename: req.file.filename,
            },
        });

        req.flash("success", "Profile picture updated successfully!");
        res.redirect("/profile");
    } catch (err) {
        next(err);
    }
});

// Booking and Order Operations
app.get("/orders/myorders", isLoggedIn, async (req, res, next) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate("listing")
            .sort({ createdAt: -1 });

        res.render("orders/myorders.ejs", { orders });
    } catch (err) {
        next(err);
    }
});

app.post("/orders/create/:listingId", isLoggedIn, async (req, res) => {
    try {
        const { listingId } = req.params;
        const { nights, checkIn, checkOut } = req.body;

        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                error: "Please select booking dates.",
            });
        }

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: "Listing not found",
            });
        }

        const totalNights = parseInt(nights);
        if (!totalNights || totalNights < 1) {
            return res.status(400).json({
                success: false,
                error: "Invalid number of nights",
            });
        }

        const totalAmount = listing.price * totalNights;
        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: `receipt_${crypto.randomBytes(4).toString("hex")}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        const newOrder = new Order({
            listing: listing._id,
            buyer: req.user._id,
            razorpayOrderId: razorpayOrder.id,
            checkIn,
            checkOut,
            nights: totalNights,
            amountPaid: totalAmount,
            status: "Created",
        });

        await newOrder.save();

        res.json({
            success: true,
            order: razorpayOrder,
            listing,
            totalAmount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
});

app.post("/orders/verify", isLoggedIn, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature === razorpay_signature) {
            await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    status: "Paid",
                    razorpayPaymentId: razorpay_payment_id,
                }
            );

            req.flash("success", "Booking payment completed successfully!");
            return res.json({ status: "success" });
        }

        await Order.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { status: "Failed" }
        );

        res.status(400).json({ status: "failure" });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// Fallback Route for Missing Resources
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err);
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// Establish Database Connections and Fire up Application Server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Server startup failed:", err);
    });