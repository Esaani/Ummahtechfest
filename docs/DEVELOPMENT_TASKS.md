# Ummah Tech Fest — Development Tasks

**Last updated:** 2026-05-28  
**Maintainers:** Update this file whenever you start, finish, or reprioritize work.

---

## How to use this file

1. Check **Current focus** before picking up work.
2. Move items to **Done** when merged or deployed, with date.
3. Add new tasks under the right section with a one-line outcome.
4. Run `python manage.py seed` after migrations on new environments.

---

## Current focus

- Payment provider integration for pass registrations
- Ghana 2026 / Schedule / Tickets full pages (flip `live: true` in `pages.js`)
- Account menu dropdown (profile, registration, volunteer links)

---

## Admin portal RBAC

| Role | Permissions | Tabs |
|------|-------------|------|
| Superadmin (`is_superuser`) | All | Dashboard, Speakers, Partners, Passes, Submissions, Team |
| `content_manager` | `cms.manage` | Speakers, Partners, Passes |
| `submissions_reviewer` | `submissions.manage` | Submissions (partners, speakers, waitlist, **volunteers**) |
| `user_manager` | `users.manage` | Team & roles (invite, PATCH role/active) |
| `operations` | `cms.manage` + `submissions.manage` | Content + Submissions |

- **Invite:** `POST /api/v1/auth/admin/users/invite/` → email with `/accept-invite?id=&token=`
- **Enforcement:** `HasAdminPermission` on CMS, outreach, volunteer admin, and user admin APIs; frontend filters nav via `user.admin_permissions` from `GET /auth/me/`
- **Migration:** `accounts.0006_admin_role_and_staff_invite`

---

## Pass registration (product rules)

- **`PassType.is_open_for_registration`:** For **`flow=open`** (paid / standard checkout), keep this **`False`** until ticket sales and checkout are live. Users see a “ticket sales” message on signup; `POST /registrations/open/` rejects when the flag is off. **`flow=approval`** passes can stay open for applications independently.
- **Seeding:** `seed_pass_types` sets open passes to **not** open for registration by default; approval passes default **open**. Admins toggle in Django admin when ready.
- **Forms:** Professional (open) and Special access (approval) use **dropdowns** for job role (with “Other”) and years of experience where applicable to reduce bad free-text. Open registration includes the **`website`** honeypot like other public-oriented flows.

---

## Done

| Date | Area | Task |
|------|------|------|
| 2026-05-28 | CMS | Event schedule admin + public API; homepage agenda wired; admin forms use selects (passes, schedule, submissions) |
| 2026-05-27 | Admin | RBAC roles, volunteer submission review tab, team invite/CRUD, permission-gated nav + routes |
| 2026-05-27 | Registrations | Pass gating: `is_open_for_registration` for open flow; signup + gate UX; seed defaults; role/experience selects + open POST honeypot |
| 2026-05-26 | Auth | Password reset: request email + confirm new password (`/forgot-password`, `/reset-password`) |
| 2026-05-26 | Frontend | Custom 404 page for unknown routes |
| 2026-05-26 | Frontend | Shared `AuthPageShell` for login / forgot / reset (no header/footer gap) |
| 2026-05-26 | Outreach | Admin submissions: partner inquiries, speaker apps, ticket waitlist |
| 2026-05-26 | Outreach | Ticket waitlist API + home form wired |
| 2026-05-26 | Frontend | Apply to Speak + Sponsor forms: role cards, styled fields, step validation |
| 2026-05-23 | Platform | Soft delete: `deleted_at` on all `BaseModel` tables |
| 2026-05-23 | Frontend | Header shows Log out + name when authenticated |
| 2026-05-23 | Backend | `apps.outreach` — sponsor inquiries + speaker applications API |
| 2026-05-23 | Backend | `apps.cms` — speakers, sponsors, passes admin + public APIs |
| 2026-05-23 | Backend | `apps.registrations` — pass types + open/approval flows |
| 2026-05-23 | Backend | `apps.volunteers` — pathways, applications |
| 2026-05-23 | Backend | Signup email OTP + honeypot + rate limits on public forms |
| 2026-05-23 | DX | Master seeder `python manage.py seed` |
| 2026-05-23 | Frontend | Page gating — Ghana 2026, Schedule, Tickets = coming soon |

---

## Auth flow (reference)

| Step | Route | API | Status |
|------|-------|-----|--------|
| Sign up — email OTP | `/create-account` | `POST /auth/signup/verify-email/*` | Done |
| Register | `/create-account` | `POST /auth/register/` | Done |
| Login | `/login` | `POST /auth/login/` | Done |
| Forgot password | `/forgot-password` | `POST /auth/password-reset/request/` | Done |
| Reset password | `/reset-password?id=&token=` | `POST /auth/password-reset/confirm/` | Done |
| Session / me | — | `GET /auth/me/`, JWT refresh | Done |

**Env:** Set `FRONTEND_URL=http://localhost:5173` in `.env` so reset emails link to the Vite dev server (not only nginx `SITE_URL`).

---

## Backend

### In progress / next

- [ ] Payment provider integration for `pending_payment` registrations
- [ ] Speaker application profile image upload (R2 + `MediaAsset`)
- [ ] Sponsor tier content in CMS instead of static HTML table
- [ ] Admin API to list/restore soft-deleted records

### Live page APIs

| Page | Endpoint(s) | Status |
|------|-------------|--------|
| Home | CMS speakers/sponsors, waitlist | Done |
| Sponsor | `POST /api/v1/outreach/sponsor-inquiries/` | Done |
| Volunteer | `/api/v1/volunteers/*` | Done |
| Apply to speak | `POST /api/v1/outreach/speaker-applications/` | Done |
| Pass signup | `/api/v1/registrations/*` | Done |
| Admin submissions | `/api/v1/outreach/admin/*`, `/api/v1/volunteers/admin/applications/` | Done |
| Admin team / RBAC | `/api/v1/auth/admin/users/*`, `staff-invite/accept` | Done |

---

## Frontend

### In progress / next

- [ ] Account menu dropdown (profile, registration status, volunteer status)
- [ ] Sponsor — prospectus download link (asset or CMS)
- [ ] Tests for password reset + 404 (RTL / MSW)
- [ ] Refactor `Login.jsx` to use `AuthPageShell` (optional cleanup)

### Coming soon pages (flip `live: true` in `frontend/src/config/pages.js`)

- [ ] Ghana 2026 — full page + CMS sections
- [ ] Schedule — agenda API or CMS-driven
- [ ] Tickets — pricing + payment CTA

---

## Infrastructure & DevOps

- [x] Production: host nginx config (`nginx/host-production.conf`) — no Docker nginx in `docker-compose.production.yml`
- [x] Telegram monitoring for major user events (`TELEGRAM_*` in `.env`, Celery task)
- [ ] Production R2 env vars on host (`R2_*` in `.env.example`)
- [ ] CI: backend tests + frontend tests on PR
- [ ] Staging environment checklist

---

## Public form security (honeypot + rate limits)

All user-submitted forms use a hidden `website` honeypot field (`HoneypotField` + `HoneypotSerializerMixin`). Bots that fill it get `400 Invalid submission`.

| Form | Route | Auth | Honeypot | Throttle scope |
|------|-------|------|----------|----------------|
| Signup OTP / register | `/create-account` | No | Yes | `otp_send`, `otp_confirm`, `auth` |
| Login | `/login` | No | Yes | `auth` |
| Forgot / reset password | `/forgot-password`, `/reset-password` | No | Yes | `password_reset` |
| Partner inquiry | `/sponsor` | No | Yes | `public_form` |
| Apply to speak | `/apply-to-speak` | No | Yes | `public_form` |
| Ticket waitlist | Home `#tickets` | No | Yes | `public_form` |
| Pass registration (open) | `/professional-details` | Yes | Yes | `authenticated_form` |
| Special access | `/special-access` | Yes | Yes | `authenticated_form` |
| Volunteer application | `/volunteer/apply` | Yes | Yes | `authenticated_form` |

Footer newsletter is not wired to an API yet (no submission).

---

## Seeders (`python manage.py seed`)

All idempotent seed commands are registered in `backend/common/seed_registry.py`:

| Key | Command |
|-----|---------|
| `pass_types` | `seed_pass_types` |
| `volunteer_roles` | `seed_volunteer_roles` |
| `cms_sections` | `seed_cms_sections` |
| `cms_showcase` | `seed_cms_showcase` |
| `schedule` | `seed_schedule` |

List only: `python manage.py seed --list`

---

## Conventions (reminders)

- **Soft delete:** `instance.delete()` sets `deleted_at`. Query with `Model.objects` (alive only).
- **Unique fields:** Partial unique constraints with `deleted_at IS NULL`.
- **API shape:** `{ data: ... }` success, `{ error: { code, message, details? } }` failure.
- **Auth pages:** `/login`, `/forgot-password`, `/reset-password` hide site header/footer (see `App.jsx` `hideNav`).
- **Seeding:** `docker compose exec backend python manage.py seed`

---

## Quick commands

```bash
docker compose up -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed
docker compose exec backend python manage.py test apps.accounts.tests.test_password_reset
docker compose exec backend python manage.py test
cd frontend && npm test -- --run
```
