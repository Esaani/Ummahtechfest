# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Monorepo for the Ummah Tech Fest Ghana 2026 marketing site and event platform. Stack: Django + DRF backend, React + Vite frontend, PostgreSQL (host), Redis, Docker Compose.

## Running the app

The app is **fully containerized**. Docker Compose is the primary (and preferred) way to run everything. Do not rely on a local backend venv being present — use `docker compose exec` for all Django management commands.

```bash
make up                  # docker compose up -d --build
make down                # docker compose down
make migrate             # docker compose exec backend python manage.py migrate
make seed                # run all registered seeders inside the container
make seed-list           # list available seeders
make superuser           # docker compose exec backend python manage.py createsuperuser
make logs                # tail backend logs
make test-backend-docker # run all backend tests inside container (authoritative)
```

**Django management commands always go through the container:**
```bash
docker compose exec backend python manage.py <command>
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py test apps.volunteers
```

### Frontend (local, optional)

The frontend runs in Docker too, but can also be developed locally:
```bash
cd frontend
npm install
npm run dev       # Vite dev server on :5173, proxies /api → :8000
npm run build
npm test          # vitest run (one-shot)
npm run test:watch
```

### Production

```bash
make prod-up          # docker compose -f docker-compose.prod.yml up -d --build
make prod-migrate
make prod-seed        # includes seed_sponsorship
make prod-superuser
make prod-logs
```

## Architecture

### Backend (`backend/`)

- **`config/`** — Django settings (env-driven via `django-environ`), URL root, Celery, WSGI
- **`common/`** — Shared infrastructure: `BaseModel`, permissions, seed registry, middleware, email/Telegram services, throttling
- **`apps/accounts/`** — Auth: custom `User` (email-based), `EmailVerification` (OTP), `PasswordReset`, `StaffInvite`, `ParticipantInvite`
- **`apps/volunteers/`** — Volunteer pathways (roles) and applications pipeline
- **`apps/registrations/`** — `PassType` and `PassRegistration` with approval/open flows and Paystack payment integration
- **`apps/cms/`** — `SiteSection` (slug-keyed JSON content), `MediaAsset`, `FeaturedSpeaker`, `ScheduleSession`, `SponsorshipPackage`, `FeaturedSponsor`, `AttendeeVoice`
- **`apps/outreach/`** — `SponsorInquiry`, `SpeakerApplication`, ticket waitlist, newsletter subscription
- **`apps/payments/`** — Paystack webhooks, `Donation`, `Withdrawal`, Finance module (Wallet, Bill, Expense, Goal)

API base: `GET /api/v1/` — documented at `/api/v1/docs/` (Swagger, enabled in dev).

#### Key backend patterns

**BaseModel** (`common/models.py`): All models inherit from it. Provides UUID primary key, `created_at`/`updated_at`, soft delete (`deleted_at`). `objects` manager filters out soft-deleted rows; `all_objects` does not. Every concrete model **must** define `Meta.db_table` without an app prefix — enforced at class definition time.

**Admin RBAC**: `AdminRole` text choices on `User`. `HasAdminPermission` (in `common/permissions.py`) checks `view.admin_permission` against `ROLE_PERMISSIONS` in `common/admin_roles.py`. Superusers bypass all checks.

**Seeding**: Add a `management/commands/seed_*.py`, register it in `common/seed_registry.py` SEEDERS tuple (in dependency order). All seeders must be idempotent. `python manage.py seed` runs them all; `--list` shows registered entries.

**Error format**: All API errors return `{ "error": { "code": "...", "message": "...", "details": {...} } }`. Internal details (stack traces, SQL) are never sent to clients — logged server-side with `request_id`.

### Frontend (`frontend/src/`)

- **`api/client.js`** — All API calls. Domain-grouped exports: `authApi`, `registrationsApi`, `outreachApi`, `cmsApi`, `paymentsApi`, `volunteerApi`. `apiRequest()` handles JWT injection and error normalization into `ApiError`.
- **`context/AuthContext.jsx`** — Auth state provider. JWT tokens in `localStorage`. Exposes `user`, `login`, `logout`, `register`, `isAuthenticated`, `isSuperAdmin`, `isAdminUser`, `hasAdminPermission`.
- **`config/pages.js`** — `PAGES` map with `live` boolean per route. Set `live: false` to show a branded "coming soon" page.
- **`components/GatedPage.jsx`** — Wraps routes; renders coming-soon UI when `isPageLive(path)` returns false.
- **`pages/admin/`** — Admin portal (dashboard, speakers, sponsors, passes, submissions, users, schedule, finance, media, donations).
- **`config/adminPermissions.js`** — Frontend mirror of backend role→permission map.

#### Key frontend patterns

**Page gating**: Wrap a route's element in `<GatedPage path={PAGES.foo.path}>` and toggle `live` in `config/pages.js`. No backend change needed to hide/show a page.

**Admin permission checks**: Use `hasAdminPermission(PERM_*)` from `useAuth()`. Permission constants defined in `config/adminPermissions.js` must stay in sync with `common/admin_roles.py`.

**API errors**: `apiRequest` throws `ApiError(code, message, details)`. Payment-related error codes and internal detail strings are sanitized before display in `sanitizeClientErrorMessage`.

## Environment

Copy `.env.example` to `.env`. Key variables:

| Variable | Purpose |
|---|---|
| `DJANGO_SECRET_KEY` | Required, 32+ chars |
| `DB_PASSWORD` | Host Postgres password |
| `VOLUNTEER_APP_PORT` | Frontend port (default 5173) |
| `API_PORT` | Django port (default 8000) |
| `REDIS_PORT` | Redis port (default 6380) |
| `CORS_ALLOWED_ORIGINS` | Match frontend port if changed |
| `APP_ENV` | `production` to enable prod guards |
| `ENABLE_API_DOCS` | `True` in dev only |
| `ENABLE_DJANGO_ADMIN` | Toggle Django admin UI |

Postgres runs on the **host** (not in Docker). Docker containers connect via the Docker bridge network — configure `pg_hba.conf` and `listen_addresses` accordingly.
