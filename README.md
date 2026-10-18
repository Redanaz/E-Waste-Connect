# E-Waste Connect

A web platform that connects people with verified recycling centers for responsible e-waste and battery disposal. Users can find nearby centers by location or PIN code, check which waste categories each center accepts, and submit and track pickup or drop-off requests. Recycling center admins manage their center and handle incoming requests.

The initial version focuses on **Hyderabad**, with planned expansion to Telangana and the rest of India.

## Features

- Role-based access: **User**, **Center Admin**, **System Admin**
- Search recycling centers by current location or PIN code
- Filter by e-waste category (mobile phones, laptops, batteries, chargers and cables, components, other)
- See distance, accepted categories, and pickup/drop-off options
- Interactive map with routes to the selected center
- Disposal requests with status tracking: `Requested -> Accepted -> Processing -> Completed`
- Center management: details, location, accepted categories, incoming requests
- System admin verification of centers and platform oversight

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | Supabase PostgreSQL with PostGIS |
| Frontend | HTML, CSS, JavaScript |
| Maps | Leaflet.js, OpenStreetMap |
| Geocoding | Nominatim |
| Routing | OSRM |
| Auth | bcrypt + JWT |

## Project structure

```
e-waste-connect/
├── server/
│   ├── app.js
│   ├── index.js
│   ├── config/          # Supabase client
│   ├── middleware/      # JWT auth, role checks
│   ├── routes/          # auth, centers, categories, requests, admin, geo (route logic included)
│   ├── services/        # nominatim.js, osrm.js
│   └── utils/
├── public/              # Frontend pages, css, js
├── supabase/
│   └── schema.sql       # Tables, seed data, nearby_centers() function
├── scripts/
│   └── seed.js          # Sample users and center
├── .env.example
├── package.json
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18 or later
- A free [Supabase](https://supabase.com) account
- Git

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/e-waste-connect.git
cd e-waste-connect
npm install
```

### 2. Set up Supabase

1. Create a new project in the Supabase dashboard.
2. Enable the **PostGIS** extension (Database -> Extensions -> search `postgis` -> enable).
3. Open the **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
PORT=3000
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<your-service-role-or-secret-key>
JWT_SECRET=<long-random-string>
```

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> **Never commit `.env`.** The service key has full database access and must only be used on the server.

### 4. Seed sample data (optional)

```bash
npm run seed
```

This creates a system admin, a center admin with a verified sample center in Hyderabad, and a regular user. The credentials are printed in the terminal.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API overview

All endpoints are prefixed with `/api`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Categories | `GET /categories` |
| Geo | `GET /geo/geocode`, `GET /geo/route` |
| Centers | `GET /centers/nearby`, `GET /centers/:id`, `POST /centers`, `PUT /centers/:id`, `PUT /centers/:id/categories` |
| Requests | `POST /requests`, `GET /requests/mine`, `GET /requests/center`, `PATCH /requests/:id/status` |
| Admin | `GET /admin/users`, `GET /admin/centers`, `GET /admin/requests`, `PATCH /admin/centers/:id/verify` |

## System design

The platform was designed using Data Flow Diagrams:

- **Level 0:** a single E-Waste Connect process exchanging data with User, Center Admin, System Admin, and map services (Nominatim, OSRM)
- **Level 1:** authentication, center management, center verification, search and route, request handling
- **Level 2:** request management (submit, track, review, update status)

## Roadmap

- Notifications for request status changes
- Image upload for e-waste items
- Center ratings and reviews
- Expansion to Telangana and India
- Analytics for centers and admins

## Notes on external services

Nominatim and the public OSRM server are free community services intended for light use. Send a proper `User-Agent`, respect rate limits (about 1 request per second for Nominatim), and consider self-hosting or a commercial provider for production.

## Team

- R. Sahasra Reddy
- Reda Naz Zia
- S. Amulya

Methodist College of Engineering and Technology, Hyderabad
