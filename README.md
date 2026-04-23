# Glow Up Fitness App

A bilingual fitness dashboard with Supabase Auth, Supabase Database, and a Vercel-ready frontend.

## What is included
- Email + password login
- Google login via Supabase OAuth
- User-specific dashboard data
- Profile sync to Supabase
- Weight tracking
- Meal logging
- Daily water tracking
- Minimalist / corporate UI with glassmorphism

## Install
```bash
npm install
```

## Environment variables
Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Run locally
```bash
npm run dev
```

## Build for production
```bash
npm run build
```

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run the file at `supabase/schema.sql`.
4. In **Authentication -> Providers**, enable **Email** and **Google**.
5. In **Authentication -> URL Configuration**, add:
   - `http://localhost:5173`
   - your Vercel domain
6. For Google OAuth, add the Supabase callback URL in Google Cloud Console if needed.

## Tables created
- `profiles`
- `meal_logs`
- `weight_logs`
- `daily_metrics`

## Important notes
- The frontend does not need a custom Node.js backend.
- Data is protected by Row Level Security, so each user only sees their own rows.
- Default Supabase auth emails are used for confirmation and password reset.
