# BHULink

A full-stack social media and real-time chat platform built with the MERN stack. BHULink combines direct messaging, group chat, posts, reels, announcements, and role-aware features in one modern web experience.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](./LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)](./frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933)](./backend)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248)](https://www.mongodb.com/)
[![Realtime](https://img.shields.io/badge/Realtime-Socket.IO-010101)](https://socket.io/)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security Notes](#security-notes)

## Overview

BHULink is designed for campus and community collaboration. It provides:

- real-time one-to-one and group messaging,
- social content sharing through posts and reels,
- announcements and notifications,
- profile and user management.

The app is split into a React frontend and an Express/MongoDB backend, with Socket.IO for live messaging updates.

## Key Features

- Authentication with JWT-based sessions
- Real-time chat and group conversations
- Post and reel interactions (like/comment/share)
- In-app notifications and updates
- Admin/faculty-style moderation and management routes
- Responsive UI built with Tailwind CSS

## Tech Stack

**Frontend**
- React
- Vite
- Redux Toolkit
- Tailwind CSS
- Socket.IO Client

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT + bcryptjs
- Nodemailer

## Project Structure

```text
SocialMediachat-main/
|-- backend/                 # API server, auth, DB models, sockets
|   |-- api/
|   |-- config/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   `-- server.js
|-- frontend/                # React client app
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- redux/
|   |   |-- socket/
|   |   `-- utils/
|   `-- vite.config.js
|-- docs/
|   `-- screenshots/         # Project screenshot assets
`-- README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm
- MongoDB (local instance or MongoDB Atlas)

### 1) Clone Repository

```bash
git clone https://github.com/lilhop36/BHULink.git
cd BHULink
```

### 2) Install Dependencies

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3) Configure Environment Variables

Copy `.env.example` values into your own private `.env` files.

### 4) Run Development Servers

Terminal 1 (backend):
```bash
cd backend
npm run dev
```

Terminal 2 (frontend):
```bash
cd frontend
npm run dev
```

Frontend default URL: `http://localhost:5173`  
Backend default URL: `http://localhost:9000`

## Environment Variables

### Backend (`backend/.env` or root `.env` based on your setup)

- `PORT`
- `FRONTEND_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`

### Frontend (`frontend/.env`)

- `VITE_BACKEND_URL`

See `.env.example` for safe sample values.

## Screenshots

Add your screenshots in `docs/screenshots/`, then keep these links updated:

![Dashboard](docs/screenshots/dashboard-placeholder.png)
![Chat View](docs/screenshots/chat-placeholder.png)
![Group Settings](docs/screenshots/group-settings-placeholder.png)
![Admin Panel](docs/screenshots/admin-placeholder.png)

Tip: record a 10-20 second GIF for the chat flow and add it here for a stronger first impression.

## Roadmap

- [ ] Add automated tests (frontend + backend)
- [ ] Add CI workflow for lint/build checks
- [ ] Add production deployment guide
- [ ] Improve accessibility and keyboard navigation

## Contributing

Contributions are welcome. Please read `CONTRIBUTING.md` for branch naming, commit style, and PR expectations.

## Security Notes

- Do not commit real `.env` files or credentials.
- If secrets were previously committed, rotate them immediately.
- Prefer GitHub secrets for CI/CD and deployment tokens.
