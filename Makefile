.PHONY: up down build test migrate seed superuser logs prod-up prod-down prod-migrate prod-seed prod-superuser prod-logs

up:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

test:
	cd backend && .venv/bin/python manage.py test common apps.accounts apps.volunteers

test-backend-docker:
	docker compose exec backend python manage.py test common apps.accounts apps.volunteers apps.registrations apps.cms apps.outreach

migrate:
	docker compose exec backend python manage.py migrate

seed:
	docker compose exec backend python manage.py seed

seed-list:
	docker compose exec backend python manage.py seed --list

superuser:
	docker compose exec backend python manage.py createsuperuser

logs:
	docker compose logs -f backend

COMPOSE_PROD = docker compose -f docker-compose.prod.yml

prod-up:
	$(COMPOSE_PROD) up -d --build

prod-down:
	$(COMPOSE_PROD) down

prod-migrate:
	$(COMPOSE_PROD) exec backend python manage.py migrate

prod-seed:
	$(COMPOSE_PROD) exec backend python manage.py seed
	$(COMPOSE_PROD) exec backend python manage.py seed_sponsorship

prod-superuser:
	$(COMPOSE_PROD) exec backend python manage.py createsuperuser

prod-logs:
	$(COMPOSE_PROD) logs -f backend celery
