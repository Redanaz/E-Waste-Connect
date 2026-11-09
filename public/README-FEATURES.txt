E-WASTE CONNECT - FRONTEND FEATURE BUNDLE

INSTALL
1. Back up your existing project.
2. Copy the contents of this bundle's public/ folder into your project's public/ folder, preserving subfolders.
3. Do not replace server/, package.json, .env, or your backend files.
4. Start the existing app and open the pages listed below.

NEW PAGES
- /track-requests.html (uses existing GET /api/requests/mine when signed in; otherwise demo data)
- /notifications.html (demo data; expected notification APIs below)
- /center-analytics.html (demo metrics; expected analytics API below)
- /certificates.html (sample printable certificate; expected certificate API below)
- /impact.html (demo metrics; expected impact API below)
- /feedback.html (local preview; attempts POST when signed in)

UPDATED EXISTING PAGES
- user-dashboard.html: feature shortcuts added; existing request form and API logic retained.
- center-dashboard.html: analytics link added; existing center management logic retained.

BACKEND CONTRACTS FOR YOUR FRIEND
1. GET /api/notifications/mine -> [{id,title,body,read,created_at,type,link}]
2. PATCH /api/notifications/:id/read -> marks one notification read
3. PATCH /api/notifications/read-all -> marks all current user's notifications read
4. GET /api/centers/analytics -> {total_requests,completed_requests,pending_requests,categories_count,monthly:[{month,count}],categories:[{name,count}]} scoped to authenticated center admin
5. GET /api/certificates/mine -> [{id,certificate_number,user_name,center_name,category_name,quantity,completed_at}] for completed and verified requests only
6. GET /api/impact/mine -> {total_items,recycled_items,completed_requests,categories_count}; values should be derived from verified/completed records.
7. POST /api/feedback -> {center_name or center_id,request_id,rating,comment}; server must verify the request belongs to the user and is completed before accepting.

IMPORTANT
- Sample/demo records are not real submissions, alerts, impact measurements, or issued certificates.
- All new pages use the existing /js/api.js helper and existing /css/styles.css.
- The new feature-pages.css is additive; it does not replace your existing stylesheet.
- The analytics page is intended for a signed-in centre admin. Feature pages remain previewable without login so the frontend can be reviewed before backend work is complete.
