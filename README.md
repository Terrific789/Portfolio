# Izunna Rex Portfolio

API-first portfolio system with a static frontend and Django REST APIs.

## Architecture

- Frontend: static HTML/CSS/JS (`myportfolio/templates`, `myportfolio/static`)
- Backend: Django + DRF APIs (`/api/projects/`, `/api/contact/`, `/api/csrf/`)
- Admin: Django Admin for project/content management
- Contact flow: validates on frontend and backend, stores in DB, sends email notification

## Local Run

1. Create and activate a virtual environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Copy environment file:
   - `copy .env.example .env` (Windows)
4. Run migrations:
   - `python myportfolio/manage.py migrate`
5. Seed default projects:
   - `python myportfolio/manage.py seed_projects`
6. Start server:
   - `python myportfolio/manage.py runserver`

## Tests

- `python myportfolio/manage.py test api`

## Render Deployment (Free)

This repository is already configured for Render using `render.yaml` and `Procfile`.

### Option A: Blueprint deploy (recommended)

1. Push this repo to GitHub.
2. In Render, click `New` -> `Blueprint`.
3. Select this repository.
4. Render provisions:
   - Web service
   - PostgreSQL database
5. Add missing secret env values in Render:
   - `EMAIL_HOST_USER`
   - `EMAIL_HOST_PASSWORD`
   - `DEFAULT_FROM_EMAIL`
6. Deploy.

### Option B: Manual Web Service deploy

- Environment: `Python`
- Build command:
  - `pip install -r requirements.txt && python myportfolio/manage.py collectstatic --noinput`
- Start command:
  - `python myportfolio/manage.py migrate --noinput && python myportfolio/manage.py seed_projects && gunicorn core.wsgi:application --chdir myportfolio`

### Required env vars

- `DJANGO_SECRET_KEY` (or `SECRET_KEY`)
- `DJANGO_DEBUG=false` (or `DEBUG=false`)
- `DJANGO_ALLOWED_HOSTS=.onrender.com`
- `DJANGO_CSRF_TRUSTED_ORIGINS=https://*.onrender.com`
- `DATABASE_URL` (from Render Postgres)
- `EMAIL_HOST_USER`
- `EMAIL_HOST_PASSWORD`
- `DEFAULT_FROM_EMAIL`
- `CONTACT_RECEIVER_EMAIL`

## Important note

For this project, WSGI module is `core.wsgi`, not `myportfolio.wsgi`, because `manage.py` is inside the `myportfolio/` folder and the Django project package is `core/`.
