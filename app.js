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
const { GoogleGenAI } = require("@google/genai");

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

// Robust model cascade with retry and jitter for high demand (503) & deprecation handling
async function generateWithFallback(ai, contents) {
    const candidateModels = [
        "gemini-3.8-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash"
    ];
    let lastError = null;

    for (const model of candidateModels) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents,
                });
                if (response && response.text) {
                    return response.text;
                }
            } catch (err) {
                lastError = err;
                const status = err.status || err.code;

                if (status === 503 && attempt === 0) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    continue;
                }

                console.warn(`Model ${model} issue (${status || err.message}), attempting fallback...`);
                break;
            }
        }
    }
    throw lastError;
}

// AI Chat Assistant Endpoint
app.post("/api/ai/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || message.trim() === "") {
            return res.status(400).json({ success: false, reply: "Please enter a question." });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, reply: "GEMINI_API_KEY is not configured in .env file." });
        }

        const listings = await Listing.find({}).limit(15).select("title location country price category");
        const catalog = listings.map(l => `- "${l.title}" in ${l.location}, ${l.country} (${l.category}): ₹${l.price}/night`).join("\n");

        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are StayNest AI Assistant, a friendly and concise travel advisor for StayNest vacation platform. Answer traveler inquiries crisply in 2-3 sentences. Here is the current available listing catalog:\n${catalog}\nSuggest relevant stays with price and location when suitable.`;

        const replyText = await generateWithFallback(ai, `${systemPrompt}\n\nUser Question: ${message}`);
        res.json({ success: true, reply: replyText });
    } catch (err) {
        console.error("AI Assistant Final Error:", err);
        res.status(500).json({ 
            success: false, 
            reply: "The AI assistant is temporarily busy with high traffic. Please explore our stays directly or try again in a few seconds!" 
        });
    }
});

// AI Listing Description Generator Endpoint
app.post("/api/ai/generate-description", isLoggedIn, async (req, res) => {
    try {
        const { title, location, country, category } = req.body;
        if (!title || !location) {
            return res.status(400).json({ success: false, message: "Title and location are required." });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: "GEMINI_API_KEY is missing." });
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Write an enticing, elegant, and professional 3-4 sentence property description for a vacation rental listing named "${title}" located in ${location}, ${country || ""} under the category "${category || 'Vacation Home'}". Highlight comfort, surroundings, and vibes. Do not include markdown headers or bullet points.`;

        const description = await generateWithFallback(ai, prompt);
        res.json({ success: true, description: description.trim() });
    } catch (err) {
        console.error("AI Description Final Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "AI service is currently busy. Please write a manual description or try again shortly." 
        });
    }
});

// Main Feature Routers
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

const PDFDocument = require("pdfkit");

// Download Reservation PDF Invoice
app.get("/orders/:orderId/invoice", isLoggedIn, async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({ _id: orderId, buyer: req.user._id })
            .populate("listing")
            .populate("buyer");

        if (!order) {
            req.flash("error", "Reservation invoice not found.");
            return res.redirect("/orders/myorders");
        }

        if (order.status !== "Paid") {
            req.flash("error", "Invoices are only issued for confirmed, paid bookings.");
            return res.redirect("/orders/myorders");
        }

        const doc = new PDFDocument({ margin: 50, size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=StayNest-Receipt-${order.razorpayOrderId || order._id}.pdf`
        );

        doc.pipe(res);

        // Header brand styling
        doc.fillColor("#FF385C").fontSize(26).font("Helvetica-Bold").text("StayNest", 50, 45);
        doc.fillColor("#64748B").fontSize(9).font("Helvetica").text("FIND YOUR PERFECT STAY", 50, 75);

        doc.fillColor("#0F172A").fontSize(18).font("Helvetica-Bold").text("BOOKING RECEIPT", 360, 45, { align: "right" });
        doc.fillColor("#475569").fontSize(9).font("Helvetica")
            .text(`Invoice ID: ${order._id}`, 360, 70, { align: "right" })
            .text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, 360, 83, { align: "right" })
            .text(`Status: CONFIRMED & PAID`, 360, 96, { align: "right" });

        doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(50, 125).lineTo(550, 125).stroke();

        // Customer & Reservation Information
        doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold").text("GUEST DETAILS", 50, 145);
        doc.fillColor("#475569").fontSize(10).font("Helvetica")
            .text(`Name / User: ${order.buyer?.username || order.buyer?.email?.split("@")[0] || "Valued Guest"}`, 50, 162)
            .text(`Email: ${order.buyer?.email || "N/A"}`, 50, 178);

        doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold").text("PAYMENT DETAILS", 340, 145);
        doc.fillColor("#475569").fontSize(10).font("Helvetica")
            .text(`Order ID: ${order.razorpayOrderId || "N/A"}`, 340, 162)
            .text(`Payment ID: ${order.razorpayPaymentId || "N/A"}`, 340, 178);

        // Property & Itinerary Details
        doc.rect(50, 215, 500, 75).fillAndStroke("#F8FAFC", "#E2E8F0");
        doc.fillColor("#0F172A").fontSize(12).font("Helvetica-Bold").text(order.listing?.title || "Reserved Property", 68, 228);
        doc.fillColor("#64748B").fontSize(10).font("Helvetica")
            .text(`${order.listing?.location || ""}, ${order.listing?.country || ""}`, 68, 245)
            .text(`Category: ${order.listing?.category || "Vacation Stay"}`, 68, 260);

        doc.fillColor("#0F172A").fontSize(10).font("Helvetica-Bold")
            .text(`Check-In: ${new Date(order.checkIn).toLocaleDateString("en-IN")}`, 380, 235)
            .text(`Check-Out: ${new Date(order.checkOut).toLocaleDateString("en-IN")}`, 380, 255);

        // Price breakdown table
        const tableTop = 320;
        doc.rect(50, tableTop, 500, 26).fill("#F1F5F9");
        doc.fillColor("#1E293B").fontSize(9).font("Helvetica-Bold")
            .text("DESCRIPTION", 65, tableTop + 8)
            .text("RATE / NIGHT", 280, tableTop + 8)
            .text("DURATION", 390, tableTop + 8)
            .text("AMOUNT", 480, tableTop + 8, { align: "right" });

        const rowY = tableTop + 36;
        const ratePerNight = order.listing?.price || (order.amountPaid / (order.nights || 1));
        doc.fillColor("#334155").fontSize(10).font("Helvetica")
            .text("Accommodation Base Fare", 65, rowY)
            .text(`INR ${ratePerNight.toLocaleString("en-IN")}`, 280, rowY)
            .text(`${order.nights} Night(s)`, 390, rowY)
            .text(`INR ${order.amountPaid.toLocaleString("en-IN")}`, 480, rowY, { align: "right" });

        doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(50, rowY + 22).lineTo(550, rowY + 22).stroke();

        // Total
        const totalY = rowY + 36;
        doc.fillColor("#0F172A").fontSize(13).font("Helvetica-Bold").text("Total Paid", 340, totalY);
        doc.fillColor("#FF385C").fontSize(14).font("Helvetica-Bold").text(`INR ${order.amountPaid.toLocaleString("en-IN")}`, 460, totalY, { align: "right" });

        // Footer note
        doc.rect(50, 680, 500, 70).fillAndStroke("#FFF5F6", "#FECDD3");
        doc.fillColor("#9F1239").fontSize(9).font("Helvetica-Bold").text("THANK YOU FOR CHOOSING STAYNEST!", 65, 695);
        doc.fillColor("#881337").fontSize(8).font("Helvetica")
            .text("This receipt serves as proof of payment and confirmed reservation. Please present this document or your booking ID upon check-in.", 65, 710, { width: 470, lineGap: 3 });

        doc.end();
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

        const newCheckIn = new Date(checkIn);
        const newCheckOut = new Date(checkOut);

        if (newCheckOut <= newCheckIn) {
            return res.status(400).json({
                success: false,
                error: "Check-out date must be after check-in date.",
            });
        }

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({
                success: false,
                error: "Listing not found",
            });
        }

        // Prevent double booking against any overlapping paid reservation
        const conflict = await Order.findOne({
            listing: listingId,
            status: "Paid",
            $and: [
                { checkIn: { $lt: newCheckOut } },
                { checkOut: { $gt: newCheckIn } }
            ]
        });

        if (conflict) {
            return res.status(400).json({
                success: false,
                error: "Selected dates are no longer available. Please choose another date range.",
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
            checkIn: newCheckIn,
            checkOut: newCheckOut,
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

// Establish Database Connection and Start Server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Server startup failed:", err);
    });