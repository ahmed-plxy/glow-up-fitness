# Glow Up Fitness App

## What changed
- Added a real backend with user accounts.
- Added login/signup in the Settings page.
- User data now syncs to the backend when you are logged in.
- If you are not logged in, the app still works in local mode.

## Run locally

### 1) Install dependencies
```bash
npm install
```

### 2) Start the backend
```bash
npm run server
```

The backend runs on `http://localhost:3001`.

### 3) Start the frontend
```bash
npm run dev
```

The frontend usually runs on `http://localhost:5173`.

## Optional: change backend URL
Create a `.env` file:
```bash
VITE_API_URL=http://localhost:3001
```

## Backend endpoints
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `GET /state`
- `PUT /state`

## Notes
- Passwords are hashed with bcrypt.
- Each account gets separate saved data.
- The backend stores data in `server/db.json` for simplicity.
