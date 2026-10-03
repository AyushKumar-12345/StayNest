# 🏡 StayNest – Vacation Rental Platform

A full-stack accommodation booking platform inspired by Airbnb. Features real-time property discovery, collision-proof booking with blackout calendars, Razorpay payments, automated PDF invoices, and an AI travel assistant.

🌐 **Live Demo:** [https://staynest-dnrm.onrender.com](https://staynest-dnrm.onrender.com)

---

## ⚡ Highlights

- **Dynamic Discovery & Search:** Instant category filters (Rooms, Trending, Castles, Domes, etc.) and search across location, country, and stay title.
- **Collision-Proof Bookings:** Flatpickr calendar with real-time blackout date ranges to prevent overlapping reservations.
- **Razorpay Integration:** Complete payment workflow with cryptographic signature verification and fallback handling.
- **Instant Invoicing:** Automated PDF booking receipts and invoices generated via PDFKit.
- **AI Concierge:** Google Gemini API integration for automated listing description drafting and guest query assistance.
- **Profiles & Reviews:** Dynamic initial/image avatars, custom user profiles, guest wishlists, and 5-star ratings.

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, Passport.js
- **Frontend:** EJS, Bootstrap 5, Leaflet (OpenStreetMap), Flatpickr, FontAwesome
- **Integrations:** Cloudinary, Razorpay, Google Gemini API, PDFKit

---

## 🚀 Quick Setup

### 1. Clone & Install
```bash
git clone https://github.com/AyushKumar-12345/StayNest.git
cd StayNest
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=8080
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Seed Database & Run
```bash
node init/initData.js
npm start
```
Visit `http://localhost:8080` in your browser.

---

## 📁 Repository Layout

```text
StayNest/
├── controllers/     # Route business logic (listings, reviews, users)
├── models/          # Mongoose models (Listing, Review, User, Order)
├── routes/          # Express route definitions
├── views/           # EJS views (listings, orders, users, partials)
├── public/          # Static assets (CSS, client JS, images)
├── utils/           # Error handling and async wrappers
├── cloudconfig.js   # Cloudinary configuration
└── app.js           # Server entry point & API routes
```

---

## 👨‍💻 Developer

**Ayush Kumar**  
Information Technology | IIIT Bhubaneswar  
- **Email:** ayushkumardandapat200@gmail.com
- **LinkedIn:** [https://www.linkedin.com/in/ayush-kumar-97326636a/](https://www.linkedin.com/in/ayush-kumar-97326636a/)
- **GitHub:** [https://github.com/AyushKumar-12345](https://github.com/AyushKumar-12345)
- **Portfolio:** [https://ayush-portfolio-3yan.onrender.com](https://ayush-portfolio-3yan.onrender.com)