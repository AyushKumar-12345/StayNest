# 🏡 StayNest – Vacation Rental Platform

A full-stack accommodation booking platform inspired by Airbnb. Features real-time property discovery, collision-proof booking with blackout calendars, Razorpay payments, automated PDF invoices, and an AI travel assistant.

🌐 **Live Demo:** [https://staynest-dnrm.onrender.com](https://staynest-dnrm.onrender.com)

---

## ⚡ Highlights

- **Dynamic Discovery & Search:** Instant category filters (Rooms, Trending, Castles, Domes, etc.) and search across location, country, and stay title.
- **Collision-Proof Bookings:** Flatpickr calendar with real-time blackout date ranges to prevent overlapping reservations.
- **Razorpay Integration:** Complete payment workflow with cryptographic signature verification and fallback handling.
- **Instant Invoicing:** Automated PDF booking receipts and invoices generated via PDFKit.
- **AI Concierge & Descriptive Generator:** Google Gemini API integration for automated listing description drafting with tone selection and conversational query assistance.
- **Profiles & Reviews:** Dynamic initial/image avatars, custom user profiles, guest wishlists, and 5-star ratings.
- **Production-Grade DevOps:** Multi-stage Dockerfile, Docker Compose with health checks and volume persistence, automated test suite, and GitHub Actions CI/CD.

---

## 🛠 Tech Stack

- **Backend:** Node.js (>=18), Express.js 4.x, MongoDB Atlas / local MongoDB, Mongoose 8.x, Passport.js
- **Frontend:** EJS, Bootstrap 5.3, Leaflet (OpenStreetMap), Flatpickr, FontAwesome
- **Integrations:** Cloudinary v2, Razorpay, Google Gemini AI (`@google/genai`), PDFKit
- **DevOps & Testing:** Docker, Docker Compose, Node.js Native Test Runner (`node:test`), Supertest, GitHub Actions CI/CD

---

## 📋 Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ LTS recommended)
- **npm:** v9.0.0 or higher
- **MongoDB:** A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string or a local MongoDB server (or Docker)
- **Docker & Docker Compose:** Optional for local development; required for containerized workflows

---

## 🔐 Environment Variables

Copy the provided template to create your `.env` file:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Application listening port | `8080` |
| `NODE_ENV` | Optional | Environment mode | `development` / `production` / `test` |
| `SECRET` | **Yes** | Express session encryption secret | Random 32+ character string |
| `ATLASDB_URL` | **Yes** | MongoDB connection string (Atlas or cloud) | `mongodb+srv://user:pass@cluster...` |
| `MONGO_URL` | Optional | Local / Docker MongoDB fallback connection | `mongodb://mongo:27017/staynest` |
| `DEFAULT_OWNER` | For Seeding | Valid 24-char MongoDB User ObjectId | `64b7f1a2c3d4e5f6a7b8c9d0` |
| `CLOUD_NAME` | **Yes** | Cloudinary cloud name | `your_cloud_name` |
| `CLOUD_API_KEY` | **Yes** | Cloudinary API key | `your_api_key` |
| `CLOUD_API_SECRET`| **Yes** | Cloudinary API secret | `your_api_secret` |
| `RAZORPAY_KEY_ID` | **Yes** | Razorpay Key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | **Yes** | Razorpay Key Secret | `your_razorpay_secret` |
| `GEMINI_API_KEY` | **Yes** | Google Gemini Generative AI API Key | `AIzaSy...` |

*(Note: Real `.env` files are strictly ignored by `.gitignore` and `.dockerignore` to prevent accidental credential leakage.)*

---

## 🚀 Running Locally (Without Docker)

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database (Optional)
Ensure `ATLASDB_URL` and a valid `DEFAULT_OWNER` are defined in `.env`:
```bash
node init/index.js
```

### 3. Run Development Server
```bash
npm run dev
# or
npm start
```
Visit `http://localhost:8080` in your browser.

---

## 🐳 Running with Docker

### Build Docker Image
```bash
docker build -t staynest .
```

### Run Container
```bash
docker run -p 8080:8080 --env-file .env --name staynest staynest
```

---

## 📦 Running with Docker Compose (App + Local MongoDB)

StayNest includes a production-ready `compose.yaml` setup featuring a containerized MongoDB instance with persistent volume storage and automated healthchecks.

### 1. Start Services
```bash
docker compose up -d --build
```
This boots:
- `staynest-mongo`: MongoDB 7.0 database bound securely to `127.0.0.1:27017` with volume `staynest_mongo_data`.
- `staynest-app`: StayNest web service on port `8080`, waiting for MongoDB to become healthy before starting.

### 2. View Logs
```bash
docker compose logs -f app
```

### 3. Stop Services
```bash
docker compose down
```

---

## 🧪 Automated Testing

StayNest uses Node.js's native test runner (`node:test`) paired with `supertest` for fast, dependency-light integration and security testing.

Run all tests:
```bash
npm test
```

### What the Test Suite Verifies:
1. **Core Public Routes:** Verifies `GET /`, `/privacy`, `/terms`, `/contact` return `200 OK`.
2. **Missing Routes:** Verifies that unhandled routes return custom `404 Page Not Found` templates.
3. **Authentication & Authorization:** Checks that unauthenticated attempts to access `/listings/new`, `/profile`, `/orders/myorders` redirect to `/login`.
4. **API Security:** Asserts that unauthenticated API requests to `/api/ai/generate-description` return `401 Unauthorized` JSON instead of redirecting.
5. **Joi Schema Validation:** Tests listing price constraints, category enum restrictions, and review rating limits (1–5).
6. **Reservation Math & Logic:** Tests blackout calculation, check-out after check-in validation, and `NaN` date prevention.

---

## 🔄 GitHub Actions CI/CD Pipeline

The `.github/workflows/ci-cd.yml` workflow automatically runs on all pushes and pull requests targeting the `main` branch:

1. **`test` Job:**
   - Runs on `ubuntu-latest` with Node.js 20 LTS.
   - Installs dependencies reproducibly with `npm ci` and npm cache.
   - Executes `npm test` against mock-safe test environments.
2. **`docker-build` Job:**
   - Sets up Docker Buildx with GitHub Actions caching (`type=gha`).
   - Validates that the multi-stage Docker build succeeds and packages the application without errors.

### Deployment Status
StayNest is continuously deployed on [Render](https://render.com) using the infrastructure specification in [`render.yaml`](./render.yaml). Render monitors the `main` branch and automatically triggers a zero-downtime deployment whenever changes pass CI.

---

## 🛠 Troubleshooting

- **MongoDB Atlas SRV `ECONNREFUSED` on Windows:**
  StayNest includes automatic public DNS fallback (`8.8.8.8`, `1.1.1.1`) when running outside Docker. Inside Docker containers, this fallback is disabled (`DOCKER_CONTAINER=true`) to preserve Docker's internal DNS resolver (`127.0.0.11`).
- **Razorpay or Gemini Credentials Missing:**
  Verify that your `.env` file exists in the project root and includes all keys defined in `.env.example`.
- **Port Conflict (8080 already in use):**
  Change `PORT=8080` in `.env` to another port, e.g., `PORT=3000`.

---

## 📁 Repository Layout

```text
StayNest/
├── .github/workflows/ # GitHub Actions CI/CD pipelines
├── controllers/       # Route business logic (listings, reviews, users)
├── init/              # Database initialization and sample data
├── models/            # Mongoose models (Listing, Review, User, Order)
├── public/            # Static assets (CSS, client JS, icons)
├── routes/            # Express route declarations
├── tests/             # Automated test suite (node:test + supertest)
├── utils/             # ExpressError and wrapAsync helpers
├── views/             # EJS templates and layouts
├── .dockerignore      # Docker context exclusion rules
├── .env.example       # Safe environment configuration template
├── app.js             # Application entry point & API endpoints
├── cloudconfig.js     # Cloudinary media configuration
├── compose.yaml       # Docker Compose service definition
├── Dockerfile         # Multi-stage production container build
├── middleware.js      # Auth, ownership, and validation middleware
├── package.json       # Dependencies, engines, and npm test scripts
├── render.yaml        # Render cloud deployment blueprint
└── schema.js          # Joi input validation schemas
```

---

## 👨‍💻 Developer

**Ayush Kumar**  
Information Technology | IIIT Bhubaneswar  
- **Email:** ayushkumardandapat200@gmail.com
- **LinkedIn:** [https://www.linkedin.com/in/ayush-kumar-97326636a/](https://www.linkedin.com/in/ayush-kumar-97326636a/)
- **GitHub:** [https://github.com/AyushKumar-12345](https://github.com/AyushKumar-12345)
- **Portfolio:** [https://ayush-portfolio-3yan.onrender.com](https://ayush-portfolio-3yan.onrender.com)