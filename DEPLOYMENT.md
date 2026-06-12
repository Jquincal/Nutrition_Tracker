# Production deployment

FitStack Pro uses Vercel for the primary frontend and Railway for the API and
PostgreSQL. Railway also keeps a web service as a fallback deployment.

The current Railway project is `fitstack-pro`:

- `postgres`: Railway PostgreSQL.
- `api`: Node/Express backend, rooted at `/backend`.
- `web`: React/Vite frontend, rooted at `/frontend`.

Current Railway domains:

- API: `https://nutritiontracker-production-8f4f.up.railway.app`
- Web fallback: `https://web-production-e7aa2.up.railway.app`

Primary frontend domain:

- Vercel: `https://nutritiontracker-gamma.vercel.app`

Railway `Wait for CI` is enabled for its application services, so a failed
GitHub workflow skips deployment.

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
   EXERCISEDB_BASE_URL=https://oss.exercisedb.dev/api/v1
   API_NINJAS_API_KEY=...
   ```

   `API_NINJAS_API_KEY` is optional. The public ExerciseDB endpoint does not
   require credentials. For a RapidAPI ExerciseDB plan, also configure
   `EXERCISEDB_API_KEY` and `EXERCISEDB_HOST`. If ExerciseDB is unavailable, the
   seed still uses the bundled fallback catalog.

5. Set these variables on `web`:

   ```text
   VITE_CLERK_PUBLISHABLE_KEY=...
   VITE_API_URL=https://<api-domain>/api
   ```

6. Set API `FRONTEND_URL` to the Vercel primary domain and any explicitly
   supported fallback domains.

## Vercel setup

The Vercel project is `nutritiontracker`, rooted at `/frontend`.

Production variables:

```text
VITE_API_URL=https://nutritiontracker-production-8f4f.up.railway.app/api
VITE_CLERK_PUBLISHABLE_KEY=...
```

Its stable production alias is `https://nutritiontracker-gamma.vercel.app`.
The Vercel GitHub app must have access to `Jquincal/Nutrition_Tracker` before
Vercel can enable automatic Git deployments. Manual production deploys work
with `vercel --prod` from the repository root.

Clerk currently uses a development instance. A Clerk production domain requires
creating a production instance with `clerk deploy` and selecting a custom domain;
do not repurpose another site's domain without explicit approval.

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
