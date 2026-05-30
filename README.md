# Ummah Tech Fest

Monorepo for the Ummah Tech Fest Ghana 2026 marketing site, volunteer portal, and Django REST API.

## Structure

```
backend/          Django + DRF (apps under backend/apps/)
frontend/         React + Vite
docker-compose.yml
nginx/            Reverse proxy config
```

## Prerequisites

- Docker & Docker Compose
- PostgreSQL on the **host** (not containerized)
- Node 22+ (optional, for local frontend dev)

### Host PostgreSQL setup

```sql
CREATE USER ummah_tech_fest WITH PASSWORD 'your_password';
CREATE DATABASE ummah_tech_fest OWNER ummah_tech_fest;
```

Ensure Docker can reach Postgres (`pg_hba.conf`, listen on `0.0.0.0` or Docker bridge).

## Quick start

```bash
cp .env.example .env
# Edit .env with DB_PASSWORD and DJANGO_SECRET_KEY (32+ chars)

docker compose up --build
```

### Configurable ports (`.env`)

| Variable | Default | Service |
|----------|---------|---------|
| `VOLUNTEER_APP_PORT` | 5173 | Volunteer React app (host) |
| `VOLUNTEER_APP_CONTAINER_PORT` | 5173 | Same app inside container |
| `API_PORT` | 8000 | Django API |
| `NGINX_PORT` | 8080 | Gateway (proxies UI + API) |
| `REDIS_PORT` | 6380 | Redis |

Example — run volunteer UI on host port **3001**:

```env
VOLUNTEER_APP_PORT=3001
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://localhost:8080
```

For additional portals, see `docker-compose.portals.example.yml` (`REGISTRATION_APP_PORT`, etc.).

- Site (via nginx): http://localhost:${NGINX_PORT:-8080}
- Volunteer UI (direct): http://localhost:${VOLUNTEER_APP_PORT:-5173}
- API: http://localhost:${NGINX_PORT:-8080}/api/v1/
- API docs: http://localhost:8080/api/v1/docs/
- Django admin: http://localhost:8080/admin/

### First-time backend setup

Migrations and **all seeders** run automatically when the backend container starts (`entrypoint.sh`).
See [docs/DEVELOPMENT_TASKS.md](docs/DEVELOPMENT_TASKS.md) for the living task list.

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed          # pass types, volunteer roles, CMS sections
docker compose exec backend python manage.py seed --list   # show registered seeders
docker compose exec backend python manage.py createsuperuser
```

Or via Make: `make migrate` then `make seed`.

## Development without Docker

**Backend:**

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export $(grep -v '^#' ../.env | xargs)  # or set DB_* for localhost
python manage.py migrate
python manage.py runserver
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` to `http://localhost:8000`.

## Tests

```bash
cd backend && .venv/bin/python manage.py test common apps.accounts apps.volunteers
```

## Security notes

- API errors are **sanitized** — clients never receive stack traces, SQL, or internal paths.
- Full errors are logged server-side with `request_id` correlation.
- All DB tables use explicit names (`users`, `volunteer_roles`, etc.) without app prefixes.

## Production (single VPS)

**Not a one-click deploy** — you need host Postgres, a production `.env`, and host nginx.

Docker runs **backend**, **frontend** (built SPA), **redis**, and **celery** only. The dev **nginx container is disabled** in production; use host nginx instead.

```bash
make prod-up          # or: docker compose -f docker-compose.prod.yml up -d --build
make prod-migrate     # after first deploy / schema changes
make prod-seed        # pass types, CMS, schedule, sponsorship tiers (idempotent)
make prod-superuser   # first admin login
```

Full checklist: `nginx/HOST_SETUP.md` (TLS, `.env`, first-time `createsuperuser`, health checks).

Host nginx config: `nginx/host-production.conf` — proxies:

- `/api/`, `/admin/`, `/static/`, `/media/` → `127.0.0.1:8000`
- `/` → `127.0.0.1:8081` (frontend container)

Production compose binds API, frontend, and Redis to **localhost only**. Uploaded media persists in the `utf_media` Docker volume unless you use Cloudflare R2.

Set `APP_ENV=production`, `DEBUG=False`, and configure SMTP + Telegram in `.env`. Schedule `pg_dump` for host Postgres backups.

## Makefile shortcuts

```bash
make up          # docker compose up -d --build
make test        # backend tests (local venv)
make test-backend-docker
make migrate
make seed        # volunteer roles from program doc
make superuser
```

## Health check

`GET /api/v1/health/` returns database connectivity status (200 ok, 503 degraded).

## Frontend tests

```bash
cd frontend && npm test
```

