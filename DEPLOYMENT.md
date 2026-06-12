# Production deployment

FitStack Pro uses three Railway services connected to this GitHub repository.
The current production project is `fitstack-pro`:

- `postgres`: Railway PostgreSQL.
- `api`: Node/Express backend, rooted at `/backend`.
- `web`: React/Vite frontend, rooted at `/frontend`.

Current Railway domains:

- API: `https://nutritiontracker-production-8f4f.up.railway.app`
- Web: `https://web-production-e7aa2.up.railway.app`

Both application services deploy automatically from the `main` branch. Railway
`Wait for CI` is enabled for both, so a failed GitHub workflow skips deployment.

## Railway setup

1. Create or link the Railway project:

   ```bash
   npx @railway/cli login
   npx @railway/cli init --name fitstack-pro
   npx @railway/cli add --database postgres
   npx @railway/cli add --repo Jquincal/Nutrition_Tracker --branch main --service api
   npx @railway/cli add --repo Jquincal/Nutrition_Tracker --branch main --service web
   ```

2. In Railway, set the service root directories:

   - `api`: `/backend`
   - `web`: `/frontend`

   Railway will read each directory's `railway.json`.

3. Generate public domains for `api` and `web`.

4. Set these variables on `api`:

   ```text
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   CLERK_SECRET_KEY=...
   CLERK_PUBLISHABLE_KEY=...
   USDA_API_KEY=...
   FRONTEND_URL=https://<web-domain>
   EXERCISEDB_BASE_URL=https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1
   EXERCISEDB_HOST=edb-with-videos-and-images-by-ascendapi.p.rapidapi.com
   EXERCISEDB_API_KEY=...
   API_NINJAS_API_KEY=...
   ```

   `API_NINJAS_API_KEY` is optional. ExerciseDB credentials are optional because
   the seed has a bundled fallback catalog.

5. Set these variables on `web`:

   ```text
   VITE_CLERK_PUBLISHABLE_KEY=...
   VITE_API_URL=https://<api-domain>/api
   ```

6. In Clerk, add the Railway web domain to allowed origins and redirect URLs.

## Release behavior

The API runs versioned PostgreSQL migrations and the idempotent exercise seed as
a Railway pre-deploy command. A failed migration prevents the new release from
starting. Back up a production database before the first FitStack Pro migration
because it intentionally removes the legacy workout history.

## GitHub

The workflow in `.github/workflows/ci.yml` runs:

- Backend migrations, exercise seed and tests against PostgreSQL 16.
- Frontend lint, tests and production build.

Protect `main` in GitHub and require the `Backend tests and migrations` and
`Frontend lint, tests and build` checks before merging.
