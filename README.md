# Nutrition Tracker

Aplicación full-stack para registrar comidas, macros y entrenamientos.

## Stack

- React + Vite + TanStack Query + Clerk
- Node.js + Express + PostgreSQL
- USDA FoodData Central
- PWA instalable con actualizaciones automáticas

## Desarrollo local

1. Crear una base PostgreSQL llamada `nutrition_tracker`.
2. Copiar `backend/.env.example` a `backend/.env` y ajustar `DATABASE_URL`.
3. Copiar `frontend/.env.example` a `frontend/.env`.
4. Inicializar y arrancar:

```bash
cd backend
npm install
npm run db:init
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

Sin `VITE_CLERK_PUBLISHABLE_KEY`, el frontend usa modo demo. El backend requiere
`DEV_USER_ID` en desarrollo para aceptar ese modo. En producción, configure Clerk
y elimine `DEV_USER_ID`.

## Variables de producción

Backend: `DATABASE_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
`USDA_API_KEY`, `FRONTEND_URL`, `NODE_ENV=production`.

Frontend: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_URL`.

Para Vercel, configure el directorio raíz como `frontend`. Para Railway, configure
el directorio raíz como `backend` y ejecute `npm run db:init` antes del primer
arranque.
