# Registro de cambios

Este documento resume los cambios realizados en el repositorio
`nutrition-tracker` durante la implementación del MVP y la integración de Clerk.

## Resumen

Se transformó el proyecto inicial en una aplicación full-stack para registrar
nutrición y entrenamientos, utilizando:

- React, Vite y TanStack Query en el frontend.
- Node.js y Express en el backend.
- PostgreSQL como base de datos.
- Clerk para autenticación.
- USDA FoodData Central para búsqueda de alimentos.
- Recharts para gráficos.
- Vite PWA para instalación como aplicación.

## Backend

### Migración a PostgreSQL

- Se reemplazó la implementación previa basada en SQLite por `pg`.
- Se agregó un pool de conexiones PostgreSQL en `backend/db/database.js`.
- Se creó el script `backend/db/init.js`.
- Se agregó el comando `npm run db:init`.
- Se actualizó `backend/db/schema.sql` con las tablas:
  - `users`
  - `meals`
  - `custom_foods`
  - `workouts`
  - `foods_cache`
- Se agregaron índices para consultas por usuario y fecha.

### Servidor Express

- Se creó `backend/server.js`.
- Se configuraron CORS, JSON middleware, Clerk y manejo global de errores.
- Se agregó el endpoint público de salud:

```text
GET /api/health
```

### Autenticación con Clerk

- Se integró `@clerk/express`.
- Las rutas protegidas validan el usuario autenticado mediante Clerk.
- Se mantuvo `DEV_USER_ID` como modo demo únicamente para desarrollo sin Clerk.
- El backend fue vinculado a la aplicación Clerk:

```text
app_3EcwYeJAaceTtIMcEjOMYUGfwDN
```

### Endpoints implementados

Usuarios:

- `POST /api/users/sync`
- `GET /api/users/me`
- `PUT /api/users/me`

Comidas:

- `GET /api/meals`
- `POST /api/meals`
- `PUT /api/meals/:id`
- `DELETE /api/meals/:id`
- `GET /api/meals/search?q=...`

Alimentos personalizados:

- `GET /api/foods/custom`
- `POST /api/foods/custom`
- `PUT /api/foods/custom/:id`
- `DELETE /api/foods/custom/:id`

Entrenamientos:

- `GET /api/workouts`
- `POST /api/workouts`
- `DELETE /api/workouts/:id`

Analytics:

- `GET /api/analytics/today`
- `GET /api/analytics/week`
- `GET /api/analytics/streaks`

### Servicios

- Se creó `nutritionService.js` para buscar alimentos y normalizar nutrientes
  desde USDA.
- Se creó `calculatorService.js` para calcular calorías de cardio mediante MET.

## Frontend

### Configuración base

- Se configuró `ClerkProvider`.
- Se configuró `QueryClientProvider` de TanStack Query.
- Se agregó React Router.
- Se creó un cliente API que envía el JWT de Clerk al backend.
- Se agregaron Toasts mediante React Hot Toast.

### Autenticación visible

- Se agregó una pantalla de acceso integrada al diseño.
- Se agregaron botones separados para:
  - Ingresar.
  - Crear cuenta.
- Se agregó `UserButton` para usuarios autenticados.
- El usuario se sincroniza automáticamente con PostgreSQL al iniciar sesión.

### Páginas implementadas

- `Dashboard.jsx`: resumen diario, objetivos, comidas, entrenamientos y gráfico.
- `LogMeal.jsx`: búsqueda unificada, selección de cantidad y alimentos manuales.
- `LogWorkout.jsx`: registro de cardio y fuerza.
- `History.jsx`: consulta de comidas y entrenamientos por fecha.
- `Settings.jsx`: modificación de objetivos y peso corporal.

### Componentes y hooks

- `MacroCard.jsx`: progreso de macronutrientes.
- `WeeklyChart.jsx`: gráfico semanal de proteína.
- `Lists.jsx`: listas de comidas y entrenamientos.
- `useData.js`: queries y mutations reutilizables de TanStack Query.
- `client.jsx`: cliente HTTP autenticado.

### Diseño y accesibilidad

- Se reemplazó la pantalla inicial de Vite por una interfaz mobile-first.
- Se agregó navegación lateral para escritorio.
- Se agregó navegación inferior para dispositivos móviles.
- Se utilizaron elementos HTML nativos, etiquetas de formularios y estados de
  foco visibles.
- Se agregaron estados vacíos y mensajes de éxito/error.

## PWA y despliegue

- Se instaló y configuró `vite-plugin-pwa`.
- Se agregó un manifest instalable.
- Se configuró actualización automática del service worker.
- Se agregó `frontend/vercel.json` para soportar rutas SPA en Vercel.
- Se documentaron variables y pasos de Railway/Vercel en `README.md`.

## Configuración de Clerk CLI

- Se comprobó y actualizó Clerk CLI a la versión `1.5.0`.
- Se autenticó la CLI con una cuenta Clerk.
- Se ejecutó `clerk init` en frontend y backend.
- Se vinculó el repositorio con la aplicación Clerk configurada.
- La CLI creó:
  - `frontend/.env.local`
  - Variables Clerk en `backend/.env`
- Los archivos de entorno están ignorados por Git y no se documentan sus
  valores secretos.
- `clerk doctor` confirmó la aplicación y la instancia de desarrollo.
- La instancia de producción de Clerk todavía no está configurada.

## Archivos de configuración

- Se agregó `.gitignore` en la raíz.
- Se agregaron archivos `.env.example` para frontend y backend.
- Se actualizó `README.md` con instrucciones de desarrollo y despliegue.
- Se actualizaron los archivos `package.json` y sus lockfiles.

## Ejecución local realizada

Para probar el proyecto sin utilizar el servicio PostgreSQL del sistema:

- Se creó una instancia PostgreSQL local aislada dentro del usuario.
- Se utilizó el puerto `55432`.
- Se creó e inicializó la base `nutrition_tracker`.
- Se levantó el backend en `http://localhost:3001`.
- Se levantó el frontend en `http://localhost:5173`.

Con Clerk habilitado se comprobó:

- El frontend responde correctamente.
- `GET /api/health` responde correctamente.
- Una ruta protegida sin sesión devuelve HTTP `401`.

## Verificaciones realizadas

- `npm run build` en frontend: correcto.
- `npm run lint` en frontend: correcto.
- Validación sintáctica de los archivos backend: correcta.
- `clerk doctor` en frontend y backend: integración detectada.
- Auditoría npm de dependencias de producción: sin vulnerabilidades detectadas.

## Pendientes recomendados

- Configurar una instancia de producción en Clerk antes del despliegue.
- Configurar `USDA_API_KEY` para habilitar resultados externos.
- Provisionar PostgreSQL en Railway y ejecutar `npm run db:init`.
- Configurar las variables de producción en Railway y Vercel.
- Agregar pruebas automatizadas de API y componentes.
- Aplicar división de código para reducir el tamaño inicial del bundle.
