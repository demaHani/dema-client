# Travel Booking Frontend

This is the frontend for the Travel Booking App, built with React.

## Features
- User and admin login/signup (email & password)
- Browse and search hotels
- Book hotels
- Admin dashboard for managing hotels
- Google Maps integration for hotel locations
- Clean, modern UI

## Getting Started

### 1. Install dependencies
```
npm install
```

### 2. Start the development server
```
npm start
```

The app will run at [http://localhost:3000](http://localhost:3000).

## Project Structure
- `src/components/` — React components
- `src/App.jsx` — Main app entry point
- `public/` — Static files

## Notes
- Make sure the backend (Express.js server) is running for API requests.
- No Google/Apple OAuth is used; authentication is email/password only.

---
For backend setup, see the `dema-server/README.md` file. 