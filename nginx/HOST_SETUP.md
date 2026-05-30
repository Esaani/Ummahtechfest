# Host nginx (production)

Production uses **nginx on your host**, not a Docker nginx container.

## Architecture

```
Internet → host nginx (this config)
              ├─ /api/, /admin/, /media/ → 127.0.0.1:8000 (Django)
              └─ /                         → 127.0.0.1:8081 (frontend container, built SPA)
```

## 1. Start Docker without the nginx service

```bash
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d --build
```

`docker-compose.production.yml` binds the API and frontend only on localhost.

## 2. Install the site config

```bash
sudo cp nginx/host-production.conf /etc/nginx/sites-available/ummah-tech-fest
sudo ln -sf /etc/nginx/sites-available/ummah-tech-fest /etc/nginx/sites-enabled/
# Remove default site if it conflicts: sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Edit `server_name` and SSL blocks in `host-production.conf` for your domain.

## 3. Environment

In `.env` for production:

```env
APP_ENV=production
SITE_URL=https://ummahtechfest.com
FRONTEND_URL=https://ummahtechfest.com
ALLOWED_HOSTS=ummahtechfest.com,www.ummahtechfest.com,127.0.0.1
CORS_ALLOWED_ORIGINS=https://ummahtechfest.com
API_PORT=8000
FRONTEND_STATIC_PORT=8081
```

## Optional: serve static files from disk

If you prefer not to proxy the frontend container, build once and point `root` at `frontend/dist`:

```nginx
root /var/www/ummah-tech-fest;
location / {
    try_files $uri $uri/ /index.html;
}
```

Keep `/api/` proxied to `127.0.0.1:8000`.
