# 🏡 StayNest — Full-Stack Vacation Rental & Booking Platform

[![CI/CD Pipeline](https://github.com/AyushKumar-12345/StayNest/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/AyushKumar-12345/StayNest/actions/workflows/ci-cd.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20%20LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%207.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?logo=render&logoColor=black)](https://staynest-dnrm.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **StayNest** is a full-stack vacation rental marketplace inspired by Airbnb. It delivers a modern guest and host experience with real-time property discovery, collision-proof booking with interactive blackout calendars, cryptographic Razorpay payment verification, automated PDF invoices, and an AI-powered travel assistant and listing copywriter built on Google Gemini.

🌐 **Live Application:** [https://staynest-dnrm.onrender.com](https://staynest-dnrm.onrender.com)

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Environment Configuration](#-environment-configuration)
- [Getting Started (Local Development)](#-getting-started-local-development)
- [Docker & Containerized Deployment](#-docker--containerized-deployment)
- [Docker Compose (Full-Stack with Local MongoDB)](#-docker-compose-full-stack-with-local-mongodb)
- [REST API Reference](#-rest-api-reference)
- [Automated Testing](#-automated-testing)
- [GitHub Actions CI/CD Pipeline](#-github-actions-cicd-pipeline)
- [Production Deployment (Render)](#-production-deployment-render)
- [Security & Quality Controls](#-security--quality-controls)
- [Troubleshooting](#-troubleshooting)
- [Developer & Contact](#-developer--contact)

---

## 🏗 System Architecture

StayNest follows a modular Model-View-Controller (MVC) architecture with layered security, external media pipelines, payment gateways, and generative AI services.

```mermaid
flowchart TD
    Client["Client Browser\n(Bootstrap 5.3 + Flatpickr + Leaflet)"]
    
    subgraph ReverseProxy["Deployment & Ingress"]
        Render["Render Cloud / Reverse Proxy\n(SSL Termination & Port Routing)"]
    end

    subgraph AppServer["Node.js / Express Web Application"]
        Middleware["Security & Auth Middleware\n(Passport.js • Joi Sanitization • Flash)"]
        Controllers["Controllers & Business Logic\n(Listings • Bookings • Orders • Reviews)"]
        AIEngine["AI Travel Concierge & Generator\n(Google Gemini SDK)"]
        InvoiceGen["Automated Invoice Engine\n(PDFKit)"]
    end

    subgraph StorageLayer["Data & Persistence Layer"]
        Mongoose["Mongoose 8.x ODM"]
        MongoDB[("MongoDB Atlas / Docker Mongo 7.0\nPersistent Volume")]
        Cloudinary[("Cloudinary Media CDN\nImage Storage & Transforms")]
    end

    subgraph PaymentGateway["Fintech & Integrations"]
        Razorpay["Razorpay Payments API\n(HMAC-SHA256 Signature Verify)"]
    end

    Client -->|HTTPS Requests| Render
    Render -->|Reverse Proxy| Middleware
    Middleware --> Controllers
    Controllers --> Mongoose --> MongoDB
    Controllers -->|Uploads| Cloudinary
    Controllers -->|Create / Verify| Razorpay
    Controllers -->|Prompt & Inference| AIEngine
    Controllers -->|Stream Document| InvoiceGen
    InvoiceGen -->|PDF Receipt Download| Client
```

---

## ✨ Key Features

### 1. 🗓 Collision-Proof Reservation Engine
- **Interactive Calendar:** Built on Flatpickr, dynamically blacking out booked date intervals fetched directly from existing reservations.
- **Atomic Conflict Prevention:** Server-side date intersection validation ensures overlapping reservations cannot be booked simultaneously.
- **Dynamic Pricing Calculator:** Real-time client-side and server-side night count calculation including GST/taxes and cleaning fees.

### 2. 🤖 Gemini Generative AI Travel Assistant & Copywriter
- **AI Listing Description Generator:** Hosts can draft compelling property descriptions in seconds by selecting tone personas:
  - *✨ Luxury & Elegant* — Highlighting premium comforts, architecture, and luxury amenities.
  - *🏡 Cozy & Warm* — Emphasizing homey comfort, rustic charm, and peaceful living.
  - *🌲 Adventurous & Outdoorsy* — Tailored for hikers, nature lovers, and thrill seekers.
  - *🏙 Modern & Minimalist* — Clean, contemporary, and urban living focus.
- **Conversational Travel Assistant:** Interactive chat assistant in the footer helping guests discover accommodations, explore local attractions, and answer trip queries.

### 3. 💳 Razorpay Payments & Automated PDF Invoicing
- **Cryptographic Verification:** Server-side HMAC-SHA256 validation verifying `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
- **Instant PDF Invoicing:** Headless PDF generation via `PDFKit` producing branded, itemized payment receipts ready for instant download.

### 4. 🗺 Location Discovery & Category Filters
- **Interactive Geolocation:** Property mapping powered by Leaflet and OpenStreetMap.
- **Multi-Category Discovery:** Instant category filters (Rooms, Iconic Cities, Castles, Amazing Pools, Camping, Farms, Arctic, Domes, Boats).
- **Global Search:** Instant text search across stay titles, locations, and countries.

### 5. 🛡 Complete Authentication & Authorization Suite
- **Role-Based Ownership:** Strict middleware gates (`isLoggedIn`, `isOwner`, `isReviewAuthor`) preventing unauthorized edits or deletions.
- **Custom User Profiles & Wishlists:** User dashboards tracking active bookings, created listings, and saved favorite stays.
- **Dynamic Initial Avatars:** Fallback user avatar generation based on account names when profile pictures are omitted.

---

## 🛠 Technology Stack

| Domain | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v20+ LTS recommended, >=18) | Asynchronous JavaScript backend execution |
| **Framework** | Express.js 4.21 | HTTP server, MVC routing, and REST endpoints |
| **Database** | MongoDB Atlas / Local MongoDB 7.0 | Document store for users, listings, orders, and reviews |
| **ODM** | Mongoose 8.8 | Schema validation, lifecycle hooks, and database indexing |
| **Template Engine** | EJS & EJS-Mate | Server-rendered modular views and responsive layouts |
| **Styling & UI** | Bootstrap 5.3, FontAwesome 6 | Responsive grid, mobile navigation, and modern typography |
| **Maps & Dates** | Leaflet.js (OpenStreetMap), Flatpickr | Geocoding map visualization and interactive blackout calendars |
| **Authentication** | Passport.js & Passport-Local-Mongoose | Session-based authentication and secure PBKDF2 hashing |
| **Media Storage** | Cloudinary v2 (`multer-storage-cloudinary`) | Cloud asset storage, responsive delivery, and transformations |
| **Payment Gateway** | Razorpay Node.js SDK | Order generation and HMAC-SHA256 signature verification |
| **Invoicing** | PDFKit | High-performance server-side vector PDF generation |
| **Generative AI** | Google Gemini API (`@google/genai`) | Automated listing descriptions and travel concierge |
| **Validation** | Joi | Robust request body and query parameter sanitization |
| **Containerization**| Docker & Docker Compose | Multi-stage image packaging and multi-container orchestration |
| **Testing** | Node.js Test Runner (`node:test`) & Supertest | Zero-dependency native unit, integration, and security testing |
| **CI/CD** | GitHub Actions | Automated linting, test execution, and Docker build validation |
| **Hosting** | Render Cloud Platform | Fully managed continuous deployment with zero-downtime rollouts |

---

## 📁 Project Structure

```text
StayNest/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD pipeline
├── controllers/
│   ├── listing.js             # Listing CRUD, search, and AI generator logic
│   ├── review.js              # Review creation and deletion controller
│   └── user.js                # Auth, login, logout, and profile controller
├── init/
│   ├── data.js                # Seed dataset with high-res photography
│   └── index.js               # Database seeding execution script
├── models/
│   ├── listing.js             # Listing Mongoose schema with cascading deletes
│   ├── order.js               # Booking and Razorpay order schema
│   ├── review.js              # 5-star rating and comment schema
│   └── user.js                # Passport-enabled user schema
├── public/
│   ├── css/
│   │   ├── rating.css         # Starability 5-star interactive rating UI
│   │   └── style.css          # Global theme, navbar, cards, and animations
│   └── js/
│       ├── map.js             # Leaflet geolocation rendering script
│       └── script.js          # Bootstrap form validation and client helpers
├── routes/
│   ├── listing.js             # REST endpoints for accommodations
│   ├── order.js               # Booking creation, payment verification, invoices
│   ├── review.js              # Nested review management routes
│   └── user.js                # User authentication and profile routes
├── tests/
│   └── app.test.js            # Comprehensive 17-point automated test suite
├── utils/
│   ├── ExpressError.js        # Custom HTTP error class with status codes
│   └── wrapAsync.js           # Async error handling wrapper
├── views/
│   ├── includes/              # Partials: navbar, footer, flash alerts
│   ├── layouts/               # Master boilerplate template
│   ├── listings/              # Listing views: index, show, new, edit
│   ├── orders/                # Checkout and booking confirmation views
│   └── users/                 # Signup, login, and user profile views
├── .dockerignore              # Docker build context exclusion rules
├── .env.example               # Safe environment variable configuration template
├── .gitignore                 # Git ignore file for secrets and dependencies
├── app.js                     # Main application entry point & Express setup
├── cloudconfig.js             # Cloudinary SDK storage engine configuration
├── compose.yaml               # Docker Compose multi-service definition
├── Dockerfile                 # Production multi-stage Docker build
├── middleware.js              # Authentication, authorization, and Joi middleware
├── package.json               # Node.js project manifest and test scripts
├── render.yaml                # Infrastructure-as-Code blueprint for Render
└── schema.js                  # Joi validation schemas for listings and reviews
```

---

## 🔐 Environment Configuration

Create a local `.env` file from the provided `.env.example` template:

```bash
cp .env.example .env
```

Configure the following variables with your credentials:

| Environment Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Port on which the HTTP server binds | `8080` |
| `NODE_ENV` | Optional | Runtime mode (`development`, `production`, `test`) | `development` |
| `SECRET` | **Yes** | 32+ character random secret for session encryption | `your_secure_session_secret_32_chars` |
| `ATLASDB_URL` | **Yes** | MongoDB connection string (Atlas or remote cloud) | `mongodb+srv://user:pass@cluster.mongodb.net/staynest` |
| `MONGO_URL` | Optional | Fallback connection string (used by Docker Compose) | `mongodb://staynest-mongo:27017/staynest` |
| `DEFAULT_OWNER` | For Seeding | Valid 24-character MongoDB User ObjectId for seed data | `64b7f1a2c3d4e5f6a7b8c9d0` |
| `CLOUD_NAME` | **Yes** | Cloudinary Cloud Name | `your_cloudinary_name` |
| `CLOUD_API_KEY` | **Yes** | Cloudinary API Key | `your_cloudinary_key` |
| `CLOUD_API_SECRET`| **Yes** | Cloudinary API Secret | `your_cloudinary_secret` |
| `RAZORPAY_KEY_ID` | **Yes** | Razorpay Key ID | `rzp_test_yourKeyId` |
| `RAZORPAY_KEY_SECRET` | **Yes** | Razorpay Key Secret | `your_razorpay_secret` |
| `GEMINI_API_KEY` | **Yes** | Google Gemini Generative AI API Key | `AIzaSyYourGeminiApiKey` |

> [!CAUTION]
> Never commit your real `.env` file to version control. Both `.gitignore` and `.dockerignore` are pre-configured to strictly ignore secret-bearing files.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ LTS recommended)
- **npm:** v9.0.0 or higher
- **MongoDB:** An active [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string or local MongoDB instance

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/AyushKumar-12345/StayNest.git
cd StayNest

# Install dependencies reproducibly
npm install
```

### 3. Database Seeding (Optional)
To populate the database with sample properties across various categories:
```bash
node init/index.js
```

### 4. Start Development Server
```bash
# Using nodemon for hot-reloading:
npm run dev

# Or using standard node:
npm start
```
Access the application at `http://localhost:8080`.

---

## 🐳 Docker & Containerized Deployment

StayNest features an enterprise-grade, multi-stage `Dockerfile` optimized for security and minimal image size.

### Docker Image Architecture:
- **Base Image:** `node:20-alpine` (lightweight, minimal attack surface).
- **Layer Caching:** Package manifests are copied and installed prior to application code.
- **Security Hardening:** Executes as the non-root `node` user (UID 1000).
- **Built-in Health Check:** Native Node.js HTTP healthcheck probe querying `/` every 30 seconds.

### 1. Build the Docker Image
```bash
docker build -t staynest:latest .
```

### 2. Run the Container
```bash
docker run -d \
  --name staynest \
  -p 8080:8080 \
  --env-file .env \
  --restart unless-stopped \
  staynest:latest
```

### 3. Check Container Health and Logs
```bash
# View running status and health check state
docker ps --filter name=staynest

# Stream container logs
docker logs -f staynest
```

---

## 📦 Docker Compose (Full-Stack with Local MongoDB)

StayNest includes a production-grade `compose.yaml` that orchestrates both the web application and an isolated MongoDB 7.0 database with persistent storage.

```mermaid
flowchart LR
    subgraph Host["Host Machine"]
        Port8080["Port 8080"]
        Volume[("Volume: staynest_mongo_data")]
    end

    subgraph BridgeNetwork["Docker Internal Network: staynest-network"]
        AppContainer["staynest-app\n(Node.js 20 Alpine)"]
        MongoContainer["staynest-mongo\n(MongoDB 7.0 Jammy)"]
    end

    Port8080 --> AppContainer
    AppContainer -->|Internal DNS: staynest-mongo:27017| MongoContainer
    MongoContainer --> Volume
```

### 1. Launch Services
```bash
docker compose up -d --build
```

### 2. What Docker Compose Provisions:
1. **`staynest-mongo` Service:**
   - Runs official `mongo:7.0-jammy`.
   - Persists data across restarts in named volume `staynest_mongo_data`.
   - MongoDB native healthcheck via `mongosh --eval 'db.runCommand("ping").ok'`.
2. **`staynest-app` Service:**
   - Builds from the local `Dockerfile`.
   - Depends on `staynest-mongo` with `condition: service_healthy`.
   - Automatically injects `MONGO_URL=mongodb://staynest-mongo:27017/staynest`.
   - Sets `DOCKER_CONTAINER=true` to retain Docker's internal DNS (`127.0.0.11`).

### 3. View Logs & Teardown
```bash
# Follow logs from both services
docker compose logs -f

# Stop and remove containers (data remains safe in volume)
docker compose down

# Stop containers and purge volume (destructive)
docker compose down -v
```

---

## 📡 REST API Reference

### Accommodations (`/listings`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/listings` | No | Browse listings with category filter and search |
| `GET` | `/listings/new` | **Yes** | Render form to create a new property listing |
| `POST` | `/listings` | **Yes** | Create new listing (supports multipart image upload) |
| `GET` | `/listings/:id` | No | View full listing details, reviews, and booking calendar |
| `GET` | `/listings/:id/edit`| **Yes (Owner)** | Render edit form for listing |
| `PUT` | `/listings/:id` | **Yes (Owner)** | Update listing attributes and photos |
| `DELETE`| `/listings/:id` | **Yes (Owner)** | Delete listing and all associated reviews |

### Reviews (`/listings/:id/reviews`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/listings/:id/reviews` | **Yes** | Post a new 1–5 star rating and comment |
| `DELETE`| `/listings/:id/reviews/:reviewId`| **Yes (Author)**| Delete a review |

### Bookings & Orders (`/orders`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/listings/:id/book` | **Yes** | Validate reservation dates and launch checkout |
| `POST` | `/orders/create-order` | **Yes** | Create Razorpay order ID with amount in paise |
| `POST` | `/orders/verify-payment` | **Yes** | Cryptographically verify HMAC payment signature |
| `GET` | `/orders/myorders` | **Yes** | View user's booking history and reservation status |
| `GET` | `/orders/invoice/:orderId` | **Yes** | Download dynamically generated PDF receipt |

### AI Services (`/api/ai`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/ai/generate-description` | **Yes** | Generate listing descriptions with selected tone persona |
| `POST` | `/api/ai/chat` | No | Conversational travel assistant concierge query |

### Authentication (`/`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` / `POST` | `/signup` | Render signup view / Register new user account |
| `GET` / `POST` | `/login` | Render login view / Authenticate user session |
| `GET` | `/logout` | Terminate user session and clear cookies |
| `GET` | `/profile` | View authenticated user profile and listings |

---

## 🧪 Automated Testing

StayNest features a 17-point automated test suite built using Node.js's native test runner (`node:test`) and `supertest`. This eliminates heavyweight test frameworks like Jest, ensuring lightning-fast test execution and zero native build dependencies in CI.

### Run Tests:
```bash
npm test
```

### Test Suite Coverage:

```text
TAP version 13
✔ StayNest Core Routing & HTTP Smoke Tests
  ✔ GET / should return 200 OK and render landing page
  ✔ GET /privacy should return 200 OK
  ✔ GET /terms should return 200 OK
  ✔ GET /contact should return 200 OK
  ✔ GET /non-existent-route-random-404 should return 404 error page

✔ StayNest Authentication & API Security Guards
  ✔ Unauthenticated GET /listings/new should redirect to /login
  ✔ Unauthenticated POST /api/ai/generate-description should return 401 Unauthorized JSON
  ✔ Unauthenticated GET /profile should redirect to /login
  ✔ Unauthenticated GET /orders/myorders should redirect to /login

✔ StayNest Joi Schema Validation
  ✔ Valid listing payload passes schema validation
  ✔ Listing with negative price fails schema validation
  ✔ Listing with invalid category fails schema validation
  ✔ Valid review payload passes schema validation
  ✔ Review with rating > 5 or < 1 fails schema validation

✔ StayNest Booking Calculation & Date Validation Logic
  ✔ Calculates correct night count and total amount
  ✔ Rejects check-out dates earlier than or equal to check-in
  ✔ Identifies invalid date strings correctly

17 tests passed (100% success rate)
```

---

## 🔄 GitHub Actions CI/CD Pipeline

The `.github/workflows/ci-cd.yml` pipeline triggers automatically on all pushes and pull requests to `main`.

```mermaid
flowchart TD
    Push["Push / PR to main"] --> Matrix["GitHub Actions Runner\n(ubuntu-latest • Node.js 20)"]
    
    subgraph Job1["Job: test"]
        NPMCI["npm ci (Reproducible Clean Install)"] --> TestRun["npm test (17 Native Automated Tests)"]
    end

    subgraph Job2["Job: docker-build"]
        Buildx["Set up Docker Buildx"] --> DockerBuild["Build Multi-Stage Docker Image\n(Build Caching with GitHub Actions cache)"]
    end

    Matrix --> Job1
    Matrix --> Job2
    Job1 --> QualityPassed["CI Quality Gate Passed ✅"]
    Job2 --> QualityPassed
    QualityPassed --> AutoDeploy["Render Webhook Trigger\nZero-Downtime Rollout 🚀"]
```

### Pipeline Key Aspects:
1. **Reproducible Builds:** Uses `npm ci` with caching on `package-lock.json`.
2. **Mock-Safe Environments:** Test runs set `NODE_ENV=test` which swaps `MongoStore` for in-memory session handling, removing external database dependencies during CI.
3. **Layer-Cached Docker Build:** Validates container build integrity using GitHub Actions cache (`type=gha`), avoiding redundant image downloads.
4. **Least-Privilege Security:** Permissions are locked down to `contents: read`.

---

## ☁️ Production Deployment (Render)

StayNest is deployed continuously on Render using the infrastructure-as-code specification defined in [`render.yaml`](./render.yaml).

### How Continuous Deployment Works:
1. Every commit pushed to `main` triggers the GitHub Actions CI pipeline.
2. Once CI validates tests and the Docker build, Render automatically detects the updated branch.
3. Render builds the environment using the native build command `npm install`, launches `npm start`, and routes traffic with zero downtime upon healthcheck verification.

### Production Environment Variables on Render:
Make sure the following environment variables are set in the Render Dashboard (**Environment Settings**):
- `NODE_ENV` = `production`
- `SECRET` = *(High-entropy session secret)*
- `ATLASDB_URL` = *(MongoDB Atlas connection string)*
- `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `GEMINI_API_KEY`

---

## 🔒 Security & Quality Controls

- **Cryptographic Webhook/Payment Verification:** Razorpay payments are validated via cryptographic HMAC-SHA256 signatures before confirming orders.
- **Input Sanitization & Schema Validation:** Joi schemas guard against parameter tampering, negative amounts, out-of-range ratings, and invalid categories.
- **Session Protection:** Express session cookies are configured with `httpOnly: true`, `sameSite: "lax"`, and 7-day expiration.
- **Container Sandboxing:** The Docker image runs with a non-root user (`node`), preventing privilege escalation if a vulnerability is exploited in a dependency.
- **DNS Resilience:** Includes automatic DNS resolution fallback (`8.8.8.8`) for local Windows development while respecting container internal resolvers (`127.0.0.11`) in Docker environments.

---

## 🩺 Troubleshooting

### 1. MongoDB Atlas SRV Connection Refused (`ECONNREFUSED` / `querySrv ENOTFOUND`)
- **Cause:** Some local internet providers or Windows DNS servers block SRV lookups used by `mongodb+srv://`.
- **Solution:** StayNest includes an automatic fallback in `app.js` configuring Google and Cloudflare public DNS (`8.8.8.8`, `1.1.1.1`). Inside Docker, this is disabled via `DOCKER_CONTAINER=true` to ensure Docker service discovery works.

### 2. Gemini AI Returns 404
- **Cause:** Deprecated Gemini model names (e.g. `gemini-pro`, `gemini-2.0-flash`).
- **Solution:** StayNest uses the latest active Google GenAI models (`gemini-2.5-flash` with graceful fallbacks) and error shields that prevent server crashes if an API key is missing or invalid.

### 3. Port 8080 Conflict
- **Cause:** Another process is utilizing port `8080`.
- **Solution:** Change `PORT=8080` in your `.env` file to another available port (e.g., `PORT=3000` or `PORT=5000`).

---

## 👨‍💻 Developer & Contact

**Ayush Kumar**  
*Information Technology | IIIT Bhubaneswar*  

- **Portfolio:** [https://ayush-portfolio-3yan.onrender.com](https://ayush-portfolio-3yan.onrender.com)
- **LinkedIn:** [linkedin.com/in/ayush-kumar-97326636a](https://www.linkedin.com/in/ayush-kumar-97326636a/)
- **GitHub:** [github.com/AyushKumar-12345](https://github.com/AyushKumar-12345)
- **Email:** [ayushkumardandapat200@gmail.com](mailto:ayushkumardandapat200@gmail.com)

---

<div align="center">
  <sub>Built with ❤️ by Ayush Kumar • StayNest Accommodation Platform</sub>
</div>
