# Savings Group Manager

A beginner-friendly savings group management app built with Next.js App Router, JavaScript, Tailwind CSS, MongoDB Atlas, Mongoose, Auth.js, bcryptjs, Zod, and Recharts. It records contributions only; it does not process real money.

## Run locally

1. Install Node.js 20 or newer and MongoDB Atlas access.
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI`, `AUTH_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
3. In Atlas, allow your development IP and create a database user. Use the resulting connection string as `MONGODB_URI`.
4. Install and seed the administrator:

   ```bash
   npm install
   npm run seed:admin
   npm run dev
   ```

5. Visit http://localhost:3000/login and sign in with the admin email and password from `.env.local`.

The seed script hashes the password with bcrypt before saving it. Re-running it updates the configured admin record.

## Deploy to Vercel

1. Push this project to a GitHub repository.
2. Import that repository in Vercel; the Next.js preset is detected automatically.
3. Set `MONGODB_URI`, `AUTH_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in Vercel Project Settings for Production (and Preview if needed). Use a long random `AUTH_SECRET` and restrict Atlas network access appropriately.
4. Deploy. Run `npm run seed:admin` once with production environment variables to create the admin account. You can use a trusted local terminal with the production variables or a CI job; do not commit them.
5. Open the deployed `/login` route.

## Features

- Admin-only Auth.js credentials login and server-protected pages/API.
- Group and member create, edit, list, and safe delete flows.
- Monthly contribution recording, editing, status updates, history filters, and duplicate prevention.
- MongoDB-derived dashboard totals, monthly chart, group summaries, and member status reports.
- Responsive navigation and print-friendly report output.

## Project map

- `app/`: App Router pages and API route handler.
- `components/`: shared navigation and management UI.
- `models/`: Mongoose schemas and references.
- `lib/`: database connection and Zod input schemas.
- `auth.js`: Auth.js credentials provider and session configuration.
- `scripts/seed-admin.js`: environment-driven admin seeding.

## Data safety

`.env.local` is ignored by Git. Never commit database URIs, auth secrets, or admin passwords. MongoDB is the persistent source of application records.
