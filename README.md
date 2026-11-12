# 🌱 E-Waste Connect

### ♻️ Give your e-waste a better destination.

**E-Waste Connect** is a web-based platform designed to make electronic waste disposal easier, smarter, and more accessible. It connects individuals with verified recycling centers, helping promote responsible e-waste and battery disposal.

Users can discover nearby recycling centers using their location or PIN code, explore accepted waste categories, and submit and track disposal requests. Recycling center administrators can manage their centers and handle incoming requests through dedicated dashboards.

📍 **Currently focused on Hyderabad, India**, with plans to expand across Telangana and the rest of India.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 👥 Role-Based Access | Separate access for Users, Center Admins, and System Admins |
| 📍 Smart Search | Find recycling centers using current location or PIN code |
| ♻️ Waste Categories | Filter centers based on accepted e-waste categories |
| 🗺️ Interactive Maps | View center locations, distances, and routes |
| 📦 Disposal Requests | Submit, manage, and track recycling requests |
| 🏢 Center Management | Manage center details, locations, and accepted categories |
| 🛡️ Admin Verification | Verify recycling centers and oversee platform activities |

### 🔋 Supported Waste Categories

- 📱 Mobile Phones
- 💻 Laptops
- 🔋 Batteries
- 🔌 Chargers & Cables
- ⚙️ Electronic Components
- 📦 Other E-Waste

### 📊 Request Tracking

`Requested → Accepted → Processing → Completed`

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| 🎨 Frontend | HTML, CSS, JavaScript |
| ⚙️ Backend | Node.js, Express.js |
| 🗄️ Database | Supabase PostgreSQL, PostGIS |
| 🗺️ Maps | Leaflet.js, OpenStreetMap |
| 📍 Geocoding | Nominatim |
| 🚗 Routing | OSRM |
| 🔐 Authentication | bcrypt, JWT |

---

## 📁 Project Structure

```text
e-waste-connect/
│
├── server/
│   ├── app.js
│   ├── index.js
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── public/
│   ├── css/
│   ├── js/
│   └── *.html
│
├── supabase/
│   └── schema.sql
│
├── scripts/
│   └── seed.js
│
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 📌 Prerequisites

Make sure you have:

- [Node.js](https://nodejs.org/) 18 or later
- [Supabase](https://supabase.com/) account
- Git installed on your system

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Redanaz/E-Waste-Connect.git
cd E-Waste-Connect
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Supabase

1. Create a new project in your Supabase dashboard.
2. Enable the **PostGIS** extension under Database → Extensions.
3. Open the SQL Editor.
4. Execute the SQL script available in `supabase/schema.sql`.

### 4️⃣ Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Add your configuration:

```env
PORT=3000
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-or-secret-key>
JWT_SECRET=<your-long-random-secret>
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

⚠️ **Security Note:** Never upload your `.env` file or expose your Supabase service key in frontend code or public repositories.

### 5️⃣ Seed Sample Data (Optional)

```bash
npm run seed
```

This creates sample accounts and a recycling center in Hyderabad. The generated credentials are displayed in the terminal.

### 6️⃣ Run the Application

```bash
npm run dev
```

🌐 Open your browser and visit:

**http://localhost:3000**

---

## 🔗 API Overview

All API endpoints are prefixed with `/api`.

| Module | Available Endpoints |
|---|---|
| 🔐 Authentication | `/auth/register`, `/auth/login`, `/auth/me` |
| ♻️ Categories | `/categories` |
| 📍 Geolocation | `/geo/geocode`, `/geo/route` |
| 🏢 Centers | `/centers/nearby`, `/centers/:id`, `/centers` |
| 📦 Requests | `/requests`, `/requests/mine`, `/requests/center` |
| 🛡️ Administration | `/admin/users`, `/admin/centers`, `/admin/requests` |

---

## 🧩 System Design

The platform follows a structured Data Flow Diagram (DFD) approach.

- **Level 0:** Represents the overall E-Waste Connect system and its interactions with users, center administrators, system administrators, and external map services.
- **Level 1:** Breaks the system into authentication, center management, center verification, location search, routing, and request handling.
- **Level 2:** Focuses on request management, including submission, tracking, review, and status updates.

---

## 🛣️ Future Enhancements

We're looking forward to making E-Waste Connect even better!

- 🔔 Notifications for request status updates
- 📸 Image uploads for e-waste items
- ⭐ Recycling center ratings and reviews
- 📊 Analytics dashboards for centers and administrators
- 🌍 Expansion across Telangana and India

---

## 🌐 External Services

E-Waste Connect uses community-supported services:

- **OpenStreetMap** – Map data
- **Leaflet.js** – Interactive maps
- **Nominatim** – Geocoding
- **OSRM** – Route calculations

These services have usage policies and rate limits. For production-scale deployment, appropriate hosting arrangements or commercial alternatives may be required.

---

## 👩‍💻 Our Team

Built with collaboration and a shared goal of encouraging responsible electronic waste management.

| Team Member |
|---|
| R. Sahasra Reddy |
| Reda Naz Zia |
| S. Amulya |

🎓 **Methodist College of Engineering and Technology**  
📍 Hyderabad, Telangana, India

---

### 💚 Small Actions. Cleaner Future.

**Think Before You Discard. Recycle Responsibly.**

🌱 *E-Waste Connect — Connecting People, Recycling Centers, and a Greener Tomorrow.*