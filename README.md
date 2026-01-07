# week5-day2-live-comments

A full-stack social media application built with Next.js and NestJS.

## Features

- User authentication
- Post creation and interaction
- Real-time notifications
- Comments and likes
- User following system

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Socket.io Client

### Backend
- NestJS
- TypeScript
- Socket.io
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Day2
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
- Copy `.env.example` to `.env` in backend folder
- Copy `.env.local.example` to `.env.local` in frontend folder

5. Run the application
```bash
# Backend (from backend folder)
npm run start:dev

# Frontend (from frontend folder)
npm run dev
```

## Project Structure

```
Day2/
├── backend/          # NestJS backend
│   ├── src/
│   └── ...
└── frontend/         # Next.js frontend
    ├── app/
    ├── components/
    └── ...
```