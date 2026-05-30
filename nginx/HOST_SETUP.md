# Host nginx (production)

Production uses **nginx on your VPS**, not a Docker nginx container.

Use the **standalone** compose file only:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Or: `make prod-up`

## Architecture

```
Internet → host nginx (host-production.conf)
              ├─ /api/, /admin/, /static/, /media/ → 127.0.0.1:8000 (Django + gunicorn)
              └─ /                                     → 127.0.0.1:8081 (frontend SPA container)
```

Docker services: **backend**, **frontend** (built SPA), **redis**, **celery** — bound to **localhost only**.

## Pre-deploy checklist

Before going live, confirm on the server:

- [ ] Host PostgreSQL is running and reachable from Docker (`DB_HOST=host.docker.internal` or your host IP)
- [ ] Production `.env` copied from `.env.example` and filled in (see below)
- [ ] `DJANGO_SECRET_KEY` is a strong random value (32+ chars)
- [ ] `DEBUG=False` and `APP_ENV=production`
- [ ] `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` match your domain
- [ ] SMTP email configured (`EMAIL_BACKEND`, `EMAIL_HOST`, etc.)
- [ ] Optional: R2 credentials for uploaded media, or rely on `utf_media` Docker volume
- [ ] Optional: Telegram monitoring tokens if you want alerts

## 1. Start Docker

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 2. One-time setup (first deploy)

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker compose -f docker-compose.prod.yml exec backend python manage.py seed
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_sponsorship
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

Or: `make prod-migrate`, `make prod-seed`, `make prod-superuser`

Verify health:

```bash
curl -s http://127.0.0.1:8000/api/v1/health/
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8081/
```

## 3. Install host nginx

```bash
sudo cp nginx/host-production.conf /etc/nginx/sites-available/ummah-tech-fest
sudo ln -sf /etc/nginx/sites-available/ummah-tech-fest /etc/nginx/sites-enabled/
# Remove default site if it conflicts: sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Edit `server_name` and enable the HTTPS block in `host-production.conf` after obtaining TLS certificates (e.g. certbot).

## 4. Production `.env` (minimum)

```env
APP_ENV=production
DEBUG=False
DJANGO_SECRET_KEY=<generate-a-long-random-secret>
SITE_URL=https://ummahtechfest.com
FRONTEND_URL=https://ummahtechfest.com
ALLOWED_HOSTS=ummahtechfest.com,www.ummahtechfest.com,127.0.0.1
CORS_ALLOWED_ORIGINS=https://ummahtechfest.com,https://www.ummahtechfest.com
API_PORT=8000
FRONTEND_STATIC_PORT=8081
SEED_ON_START=false
RUN_COLLECTSTATIC=true
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# ... SMTP + DB credentials ...
```

## Updates (redeploy)

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

## Optional: serve frontend from disk

If you prefer not to run the frontend container, build once and point nginx `root` at `frontend/dist`:

```nginx
root /var/www/ummah-tech-fest;
location / {
    try_files $uri $uri/ /index.html;
}
```

Keep `/api/` proxied to `127.0.0.1:8000`.
