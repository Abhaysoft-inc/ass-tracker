# AAS Tracker App (Attendance Student Syllabus)

> A full-stack application to manage student attendance, syllabus tracking, and more for educational institutions.

## Features
- Student attendance management
- Syllabus progress tracking
- Explore and dashboard tabs
- Modern UI for web and mobile
- Backend API with authentication and data storage
- Prisma ORM for database management

## Project Structure
- `backend/` - Node.js/TypeScript Express API, Prisma ORM
- `client/` - React Native/Expo app for mobile
- `web/` - Vite + React web client

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL (or your preferred database)

### Backend Setup
```bash
cd backend
npm install
# Set up environment variables in .env
npx prisma migrate dev
npm run dev
```

### Client Setup (Mobile)
```bash
cd client
npm install
npm start
```

### Web Setup
```bash
cd web
npm install
npm run dev
```

## Usage
- Access the web client at `http://localhost:5173` (default Vite port)
- Use the mobile app via Expo Go or emulator
- Backend API runs on `http://localhost:3000` (default)

## Technologies Used
- Node.js, Express, TypeScript
- React, React Native, Expo
- Prisma ORM
- PostgreSQL
- Vite

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
MIT
