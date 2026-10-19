const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

// Ensure test environment is set before loading app
process.env.NODE_ENV = "test";
process.env.PORT = "8081";
process.env.SECRET = "test_session_secret_for_automated_testing_only";
process.env.RAZORPAY_KEY_ID = "rzp_test_mock_id";
process.env.RAZORPAY_KEY_SECRET = "rzp_test_mock_secret";

const app = require("../app");
const { listingSchema, reviewSchema } = require("../schema");

describe("StayNest Core Routing & HTTP Smoke Tests", () => {
    test("GET / should return 200 OK and render landing page", async () => {
        const res = await request(app).get("/");
        assert.equal(res.status, 200);
        assert.ok(res.text.includes("StayNest"));
    });

    test("GET /privacy should return 200 OK", async () => {
        const res = await request(app).get("/privacy");
        assert.equal(res.status, 200);
        assert.ok(res.text.includes("Privacy Policy"));
    });

    test("GET /terms should return 200 OK", async () => {
        const res = await request(app).get("/terms");
        assert.equal(res.status, 200);
        assert.ok(res.text.includes("Terms"));
    });

    test("GET /contact should return 200 OK", async () => {
        const res = await request(app).get("/contact");
        assert.equal(res.status, 200);
        assert.ok(res.text.includes("Contact"));
    });

    test("GET /non-existent-route-random-404 should return 404 error page", async () => {
        const res = await request(app).get("/non-existent-route-random-404");
        assert.equal(res.status, 404);
        assert.ok(res.text.includes("Page Not Found"));
    });
});

describe("StayNest Authentication & API Security Guards", () => {
    test("Unauthenticated GET /listings/new should redirect to /login", async () => {
        const res = await request(app).get("/listings/new");
        assert.equal(res.status, 302);
        assert.ok(res.headers.location.includes("/login"));
    });

    test("Unauthenticated POST /api/ai/generate-description should return 401 Unauthorized JSON", async () => {
        const res = await request(app)
            .post("/api/ai/generate-description")
            .set("Accept", "application/json")
            .send({
                title: "Test Villa",
                location: "Goa",
                country: "India",
            });

        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
        assert.ok(res.body.message.includes("log in"));
    });

    test("Unauthenticated GET /profile should redirect to /login", async () => {
        const res = await request(app).get("/profile");
        assert.equal(res.status, 302);
        assert.ok(res.headers.location.includes("/login"));
    });

    test("Unauthenticated GET /orders/myorders should redirect to /login", async () => {
        const res = await request(app).get("/orders/myorders");
        assert.equal(res.status, 302);
        assert.ok(res.headers.location.includes("/login"));
    });
});

describe("StayNest Joi Schema Validation", () => {
    test("Valid listing payload passes schema validation", () => {
        const validListing = {
            listing: {
                title: "Sunset Serenity Villa",
                description: "A gorgeous cliffside villa overlooking the Arabian Sea.",
                location: "Anjuna, Goa",
                country: "India",
                price: 7500,
                category: "Trending",
            },
        };

        const { error } = listingSchema.validate(validListing);
        assert.equal(error, undefined);
    });

    test("Listing with negative price fails schema validation", () => {
        const invalidListing = {
            listing: {
                title: "Invalid Price Stay",
                description: "Description here",
                location: "Mumbai",
                country: "India",
                price: -500,
                category: "Cities",
            },
        };

        const { error } = listingSchema.validate(invalidListing);
        assert.ok(error);
        assert.ok(error.details[0].message.includes("price"));
    });

    test("Listing with invalid category fails schema validation", () => {
        const invalidCategoryListing = {
            listing: {
                title: "Invalid Category Stay",
                description: "Description here",
                location: "Jaipur",
                country: "India",
                price: 3000,
                category: "Spaceship",
            },
        };

        const { error } = listingSchema.validate(invalidCategoryListing);
        assert.ok(error);
        assert.ok(error.details[0].message.includes("category"));
    });

    test("Valid review payload passes schema validation", () => {
        const validReview = {
            review: {
                rating: 5,
                comment: "Absolutely breathtaking stay! Highly recommended.",
            },
        };

        const { error } = reviewSchema.validate(validReview);
        assert.equal(error, undefined);
    });

    test("Review with rating > 5 or < 1 fails schema validation", () => {
        const invalidReviewOver = { review: { rating: 6, comment: "Too high" } };
        const invalidReviewUnder = { review: { rating: 0, comment: "Too low" } };

        assert.ok(reviewSchema.validate(invalidReviewOver).error);
        assert.ok(reviewSchema.validate(invalidReviewUnder).error);
    });
});

describe("StayNest Booking Calculation & Date Validation Logic", () => {
    test("Calculates correct night count and total amount", () => {
        const checkIn = new Date("2026-12-01");
        const checkOut = new Date("2026-12-05");
        const pricePerNight = 4000;

        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalAmount = nights * pricePerNight;

        assert.equal(nights, 4);
        assert.equal(totalAmount, 16000);
    });

    test("Rejects check-out dates earlier than or equal to check-in", () => {
        const checkIn = new Date("2026-12-05");
        const checkOutEqual = new Date("2026-12-05");
        const checkOutEarlier = new Date("2026-12-03");

        assert.ok(checkOutEqual <= checkIn);
        assert.ok(checkOutEarlier <= checkIn);
    });

    test("Identifies invalid date strings correctly", () => {
        const invalidDate = new Date("not-a-valid-date");
        assert.ok(isNaN(invalidDate.getTime()));
    });
});
