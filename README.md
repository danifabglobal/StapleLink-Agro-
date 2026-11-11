# STAPLELINK Agro MVP (prototype v0.1)

A mobile-responsive harvest-to-market coordination dashboard for the Nsukka pilot (rice and tomato).

## Current features
- Dashboard overview: farmer count, expected supply, buyer demand, delivery records.
- Farmer registration.
- Expected harvest listings.
- Buyer produce requests.
- Delivery and logistics records.
- Status updates for harvest and delivery.
- Search/filter on each data page.
- Demo mode with browser localStorage when Supabase credentials are absent.
- Supabase/Postgres integration when credentials are configured.

## Run locally
Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Connect Supabase
1. Create a free Supabase project.
2. In Supabase, open SQL Editor and run `supabase/schema.sql`.
3. Open Project Settings > API. Copy the Project URL and anon/public key.
4. Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
```

5. Stop and restart the dev server (`Ctrl+C`, then `npm run dev`).

When both variables are present, the app uses Supabase. Without them, it runs in demo mode using localStorage in that browser.

## Build for deployment
```bash
npm run build
```
The production files are generated in `dist/`. Deploy the project to Vercel or another static hosting provider. Add the two VITE_SUPABASE environment variables in the hosting dashboard.

## Important prototype limitations
- Demo mode stores data only in the current browser; it is not shared between devices.
- The current Supabase policies are deliberately permissive for a controlled demonstration. They are NOT suitable for production or real personal data. Before public launch, implement Supabase Auth, role-based access (farmer, buyer, operations/admin), stricter Row Level Security, validation, audit logs, backups and privacy notices.
- The records shown on first launch are sample demonstration data. Replace them with verified pilot data before presenting actual results.
- Matching is currently a human-assisted workflow: the dashboard shows supply and demand records; it does not yet automatically allocate harvest to orders.
- No online payment, live GPS tracking, or automated transporter dispatch is included.
