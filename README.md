# World Universities & Travel App

Fullstack monorepo for:
- catalog of world universities
- directions/faculties and search by direction
- external university reviews (Google Places)
- travel place recommendations for selected university country (Google Places)

## Stack
- Frontend: React + Material UI + FSD structure
- Backend: Express + Prisma + layered/clean architecture
- Database: PostgreSQL

## Monorepo packages
- `frontend` - UI application (`http://localhost:3000`)
- `backend` - API server (`http://localhost:4000`)
- `shared` - shared TypeScript contracts

## Setup
1. Install Node.js 20+.
2. Install dependencies:
   - `npm install`
3. Create backend env:
   - `copy backend/.env.example backend/.env` on Windows
4. Set `DATABASE_URL` and `GOOGLE_PLACES_API_KEY` in `backend/.env`.
5. Run Prisma:
   - `npm run prisma:generate --workspace backend`
   - `npm run prisma:migrate --workspace backend`
   - `npm run db:seed --workspace backend`
6. Start project:
   - `npm run dev`

## API endpoints
- `GET /api/programs?query=`
- `GET /api/universities?program=`
- `GET /api/universities/:id`
- `GET /api/universities/:id/reviews`
- `GET /api/universities/:id/places`

## Notes
- The seed script loads universities from the public dataset:
  - `https://universities.hipolabs.com/search`
- Reviews and place recommendations are cached in PostgreSQL by TTL.
