# Dodoo

A full-stack web application built with Node.js, Express, MongoDB, and React with Vite and Tailwind CSS.

## Project Structure

```
Dodoo/
├── backend/          # Express API server & MongoDB models
└── frontend/         # React + Vite client application
```

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure your environment variables by creating a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Start the backend development server:

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Redux Toolkit, React Router DOM, Lucide Icons
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary, Nodemailer, Multer
