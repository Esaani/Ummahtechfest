.PHONY: up down build test migrate seed superuser logs

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
