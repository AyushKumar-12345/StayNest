# StayNest

A modern, full-stack accommodation booking platform inspired by Airbnb. This application allows users to discover premium stays, make bookings, process secure payments, and share verified reviews.

## Features

### 📅 Booking System
- **Flexible Scheduling:** Select check-in and check-out dates using an interactive calendar.
- **Duration Calculation:** Automated stay duration computation based on selected dates.
- **Live Invoicing:** Instant price breakdown and total calculation before moving to checkout.
- **History Tracking:** Dedicated booking history dashboard to view past and upcoming stays.
- **Real-Time Status:** Live order tracking across Created, Paid, and Failed lifecycles.

### 💳 Secure Payments
- **Gateway Integration:** Native integration with Razorpay payment processing infrastructure.
- **Secure Orders:** Server-side order creation preventing client-side tampering.
- **Signature Verification:** HMAC-SHA256 signature validation ensuring payment integrity.
- **Automated Fulfillment:** Immediate database status updates upon verified financial settlement.

### ⭐ Reviews & Ratings
- **Feedback Engine:** Simple 5-star rating system with text comment fields.
- **Identity Links:** Reviews directly display verified author profile information.
- **Control Rights:** Secure deletion limits ensuring only authors can remove their reviews.

### ☁️ Image Uploads
- **Cloud Infrastructure:** High-performance media hosting powered by Cloudinary.
- **Streamlined Uploads:** Multer-storage engine integration for handling multipart form data.
- **Optimized Delivery:** Automated resizing and delivery across scalable cloud networks.
- **Format Support:** Built-in validation rules accepting modern image types (`jpg`, `jpeg`, `png`, `webp`).