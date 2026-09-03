# AsifTechGlobal - Full-Stack Dynamic Platform 🚀

**A modern, production-ready Full-Stack Web Application & Management Suite for AsifTechGlobal.**

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture & Stack](#-system-architecture--stack)
- [Directory Structure](#-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
- [Default Admin Credentials](#-default-admin-credentials)
- [Admin Dashboard Features](#-admin-dashboard-features)
- [REST API Reference](#-rest-api-reference)
- [Database Schema](#-database-schema)
- [Deployment Options](#-deployment-options)
- [License](#-license)

---

## 🌟 Overview

**AsifTechGlobal** is an enterprise-grade full-stack web application featuring:
- **Client-Facing Dynamic Frontend**: Interactive home, about, services, dynamic portfolio, dynamic blog with real-time search, interactive contact form, and client payment portal.
- **Node.js Express REST API**: Production-ready backend with JWT authentication, file upload processing, database connection pooling, and email notifications.
- **Integrated Admin Control Center**: Control panel to manage inquiries, blog posts, portfolio projects, newsletter subscribers, and online payment transactions.
- **Zero-Config Database**: SQLite with automated schema migration & seed population, plus MySQL schema compatibility.

---

## ✨ Key Features

- ✅ **Full Dynamic REST API**: Powered by Node.js & Express
- ✅ **Enterprise Admin Dashboard**: `/admin` portal with JWT authentication
- ✅ **Real-Time Client Inquiries**: Contact form connected directly to database with email alerts
- ✅ **Dynamic Blog Management**: Publish, edit, and delete technology articles with image uploads
- ✅ **Dynamic Portfolio Showcase**: Showcase client projects with live category filters
- ✅ **Newsletter Engine**: Collect and export subscriber lists to CSV
- ✅ **Payment Gateway Integration**: Process invoices and project deposits (Stripe & Razorpay ready + sandbox mock)
- ✅ **Secure File/Image Upload**: Multer disk storage for blog covers and project thumbnails
- ✅ **Mobile-First Responsive Design**: 100% responsive on smartphones, tablets, and desktops

---

## 🛠️ System Architecture & Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), FontAwesome | Lightweight, ultra-fast client interface |
| **Backend Runtime** | Node.js (v18+) + Express.js | High-performance RESTful API server |
| **Database** | Native SQLite (`node:sqlite`) + MySQL Schema | Zero-dependency embedded database |
| **Authentication** | JSON Web Tokens (JWT) + Bcrypt.js | Secure stateless admin sessions |
| **File Storage** | Multer | Local disk storage for uploads |
| **Email Service** | Nodemailer | SMTP notifications with console fallback |
| **Payments** | Stripe & Razorpay compatible | Online order creation & verification |

---

## 📁 Directory Structure

```
asiftechglobalwebsite2/
├── index.html              # Home Page with Hero & Services preview
├── about.html              # About Company, Mission & Team
├── services.html           # 8 Core Services + Online Payment trigger
├── portfolio.html          # Dynamic Project Showcase
├── blog.html               # Dynamic Tech Insights & Search
├── contact.html            # Contact Form connected to API
├── css/
│   └── style.css           # Premium UI styling & toast alerts
├── js/
│   └── script.js           # Client AJAX & dynamic data engine
│
├── admin/                  # Enterprise Admin Panel
│   ├── admin.html          # Control Center Dashboard
│   ├── admin.css           # Modern Dashboard Styling
│   └── admin.js            # JWT auth, CRUD operations & modals
│
├── backend/                # Node.js API Backend
│   ├── server.js           # Express server entrypoint
│   ├── package.json        # Dependencies & start scripts
│   ├── .env.example        # Environment variables template
│   ├── .env                # Active configuration
│   ├── config/
│   │   └── db.js           # Database initialization & seeds
│   ├── middleware/
│   │   ├── auth.js         # JWT verification middleware
│   │   └── upload.js       # Multer image upload handler
│   ├── routes/
│   │   ├── auth.js         # Admin login & password change
│   │   ├── contact.js      # Contact inquiry endpoints
│   │   ├── blog.js         # Blog CRUD endpoints
│   │   ├── portfolio.js    # Portfolio CRUD endpoints
│   │   ├── newsletter.js   # Subscriber management
│   │   ├── payment.js      # Payment orders & verification
│   │   ├── upload.js       # File upload handler
│   │   └── stats.js        # Dashboard analytics metrics
│   └── uploads/            # Uploaded images & media
│
├── database/
│   ├── schema.sql          # SQL table definitions
│   ├── seed.sql            # Initial demo data
│   └── asiftech.db         # SQLite active database file
│
├── start.bat               # 1-Click launcher for Windows
└── README.md               # Documentation
```

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` in the project root. It will install dependencies, launch the server, and open your browser automatically!

### Option 2: Command Line
1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
4. **Access the application**:
   - 🌐 **Website**: [http://localhost:5000](http://localhost:5000)
   - ⚡ **Admin Dashboard**: [http://localhost:5000/admin](http://localhost:5000/admin)
   - 📡 **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔐 Default Admin Credentials

When the backend starts for the first time, it automatically creates the default administrator account:

- **Login URL:** [http://localhost:5000/admin](http://localhost:5000/admin)
- **Email:** `AsifTechGlobal696788@gmail.com`
- **Default Password:** `Admin@AsifTech2026`

*(You can change your password anytime inside the Admin Dashboard Settings tab).*

---

## 📡 REST API Reference

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server status and timestamp |
| `POST` | `/api/contact` | Submit a customer inquiry |
| `GET` | `/api/blog` | Fetch published blogs (`?category=...&search=...`) |
| `GET` | `/api/blog/:slug` | Fetch single article details |
| `GET` | `/api/portfolio` | Fetch portfolio projects (`?category=...`) |
| `POST` | `/api/newsletter` | Subscribe email to newsletter |
| `POST` | `/api/payment/create-order` | Initiate client invoice payment |
| `POST` | `/api/payment/verify` | Confirm and record payment |

### Protected Admin Endpoints (Require `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate admin |
| `GET` | `/api/auth/me` | Verify active session |
| `PUT` | `/api/auth/password` | Change admin password |
| `GET` | `/api/stats` | Dashboard metrics & recent activity |
| `GET` | `/api/contact` | List all inquiries |
| `DELETE` | `/api/contact/:id` | Delete inquiry |
| `POST` | `/api/blog` | Create new article |
| `PUT` | `/api/blog/:id` | Update article |
| `DELETE` | `/api/blog/:id` | Delete article |
| `POST` | `/api/portfolio` | Add portfolio project |
| `DELETE` | `/api/portfolio/:id` | Delete project |
| `POST` | `/api/upload` | Upload image/document |
| `GET` | `/api/newsletter` | List subscribers (exportable) |
| `GET` | `/api/payment/transactions`| View all payments & revenue |

---

## 🌐 Deployment Options

### Render / Railway / Heroku (Node.js)
1. Add environment variable `PORT` (assigned by provider).
2. Set root start command: `npm --prefix backend start`.
3. Set build command: `npm --prefix backend install`.

### VPS / Ubuntu / Debian
```bash
git clone https://github.com/Asif6967/asiftechglobalwebsite2.git
cd asiftechglobalwebsite2/backend
npm install
npm install -g pm2
pm2 start server.js --name "asiftech-app"
```

---

## 📄 License
MIT License. Developed for **AsifTechGlobal**.
