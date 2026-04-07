# HogMini

HogMini is a lightweight, production-grade feature flag engine with percentage rollouts and user targeting.

## Overview

This repository is a multi-package workspace containing:

- `hogmini-frontend`: Next.js app for authentication, organizations, projects, and feature flag management
- `hogmini-backend`: Express + Prisma API for auth, org/project management, and flag evaluation endpoints
- `hogmini-node`: TypeScript Node package (currently build-focused)

## Repository Structure

```text
.
├─ hogmini-backend/
├─ hogmini-frontend/
└─ hogmini-node/
```

## Tech Stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, Radix UI
- Backend: Express, TypeScript, Prisma ORM, PostgreSQL, Passport, JWT
- Tooling: TypeScript, tsx, ESLint, Prisma

## Key Features

- Email/password and social auth flows
- Organization and project management
- Feature flag CRUD and toggle endpoints
- SDK-friendly flag retrieval endpoint (`/sdk/rules`)
- Waitlist support in frontend API routes

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL

## Quick Start

1. Clone and enter the repository.

```bash
git clone git@github.com:ezeigboemmanuel/HogMini.git
cd HogMini
```

2. Install dependencies in each package.

```bash
cd hogmini-backend && npm install
cd ../hogmini-frontend && npm install
cd ../hogmini-node && npm install
cd ..
```

3. Create environment files.

Backend (`hogmini-backend/.env`) suggested variables:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/hogmini
JWT_SECRET=change_me
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
NODE_ENV=development

# Optional email + OAuth
RESEND_API_KEY=
FROM_EMAIL=onboarding@resend.dev
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Frontend (`hogmini-frontend/.env.local`) suggested variables:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001
WAITLIST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/hogmini_waitlist
NEXT_PUBLIC_GITHUB_URL=https://github.com/<your-org-or-user>/HogMini
NEXT_PUBLIC_X_URL=https://x.com/hogminidotcom
```

4. Run Prisma migrations/generate for backend.

```bash
cd hogmini-backend
npx prisma migrate dev
npx prisma generate
cd ..
```

5. Start the apps.

Terminal 1:

```bash
cd hogmini-backend
npm run dev
```

Terminal 2:

```bash
cd hogmini-frontend
npm run dev
```

Optional (build Node package):

```bash
cd hogmini-node
npm run build
```

6. Open the app.

- Frontend: http://localhost:3000
- Backend health: http://localhost:3001/health

## Useful Scripts

### hogmini-backend

- `npm run dev`: run backend in watch mode

### hogmini-frontend

- `npm run dev`: run frontend
- `npm run build`: production build
- `npm run start`: run production build
- `npm run lint`: lint source

### hogmini-node

- `npm run build`: compile TypeScript to `dist`

## API Notes

Backend currently exposes routes under:

- `/api/auth`
- `/api/organizations`
- `/api/projects`
- `/sdk/rules`
- `/flags` and `/flags/:id`

## Contributing

Contributions are welcome.

1. Fork the repo
2. Create a feature branch
3. Make focused changes with clear commit messages
4. Open a pull request with context and testing notes

## Security

Please do not commit real secrets. Use local `.env` files and rotate credentials if exposed.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
