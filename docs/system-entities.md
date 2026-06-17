# Ummah Tech Fest — System Entities & Capabilities

## Who Exists in the System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ALL USERS                                       │
│                                                                          │
│  ┌──────────────────────┐        ┌──────────────────────────────────┐   │
│  │   ANONYMOUS PUBLIC   │        │       AUTHENTICATED USER         │   │
│  │  (no account)        │        │       (has account + login)      │   │
│  └──────────────────────┘        └──────────────────────────────────┘   │
│                                           │                              │
│                          ┌────────────────┼────────────────────┐        │
│                          ▼                ▼                     ▼        │
│                    PARTICIPANT       STAFF / ADMIN         SUPERADMIN    │
│                    (attendee,        (has admin_role)      (all access)  │
│                     speaker,                                             │
│                     volunteer)                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. ANONYMOUS (Public Visitor)

**Can do:**
- View public pages: homepage, schedule, speakers, sponsors
- Subscribe to newsletter
- Join ticket waitlist
- Submit a sponsor inquiry
- **Start account creation** (email → OTP verification → set password)

**Cannot do:**
- Apply to speak or volunteer
- Register for a pass
- Access any admin portal

---

## 2. AUTHENTICATED USER (Participant)

A user who has verified their email and created an account.

**Can do (always):**
- Login / logout
- Reset password
- View their own profile (`/auth/me/`)
- Apply to speak (submit `SpeakerApplication`)
- Apply to volunteer (submit `VolunteerApplication`)
- View their own application statuses

**Can do (once approved / pass registered):**
- Register for an event pass (Open Pass or Special Access)
- View their registration (`/registrations/me/`)

**Cannot do:**
- See other users' data
- Access admin portal

---

## 3. STAFF ROLES (Admin Portal Access)

All staff are `User` records with `is_staff=True` and an `admin_role`. They are invited via `StaffInvite` and set their password on first login.

| Role | What They Can Do |
|------|-----------------|
| **Content Manager** | Manage CMS: Speakers, Sponsors, Sponsorship packages, Page sections, Schedule sessions, Media assets, Attendee voices |
| **Submissions Reviewer** | Review speaker applications (view, change status: accept/reject), Review volunteer applications (view, change status, assign roles) |
| **User Manager** | Invite staff members, Invite participants (speaker/volunteer invites), View & manage user accounts |
| **Operations** | Everything Content Manager + Submissions Reviewer can do, Plus: manage PassTypes, view registrations |
| **Finance Manager** | View donations & payments, Manage withdrawals, Manage wallets/bills/expenses/goals |
| **Superadmin** | ALL of the above + grant/revoke admin roles to others |

---

## 4. DATA ENTITIES (What Gets Stored)

### Accounts Domain
```
User
 ├── email (unique)
 ├── first_name, last_name
 ├── is_staff (bool) — has admin portal access
 ├── admin_role (content_manager | submissions_reviewer | user_manager | operations | finance | null)
 └── is_superuser (bool) — all permissions

EmailVerification   — OTP record for signup email check
PasswordReset       — one-time token for password reset
StaffInvite         — invite link sent to a new staff member
ParticipantInvite   — invite link sent to a speaker or volunteer (type: speaker | volunteer)
```

### Outreach Domain
```
SpeakerApplication
 ├── user (FK → User, nullable — anonymous allowed)
 ├── source (public | invited)
 ├── status (draft → submitted → under_review → accepted | rejected)
 ├── personal: full_name, email, occupation, role, professional_title, organization, bio
 ├── files: profile_image_asset (FK → MediaAsset), cv_asset (FK → MediaAsset)
 ├── socials: linkedin_url, twitter_handle, instagram_handle
 └── session: session_title, track, session_format, abstract, key_takeaways, tech_requirements, co_speakers

SponsorInquiry
 ├── full_name, company_name, email
 ├── tier_interest (diamond | gold | silver | custom)
 ├── requirements (text)
 └── status (new | contacted | closed)

TicketWaitlist
 ├── full_name, email
 ├── tier_interest
 └── status (waiting | notified | registered | cancelled)

NewsletterSubscriber
 ├── email
 └── status (active | unsubscribed)
```

### Volunteers Domain
```
VolunteerRole
 ├── name, slug, description
 ├── category (event_support | creative_media | tech_training)
 └── is_active

VolunteerApplication
 ├── user (FK → User)
 ├── status (submitted → under_review → interview → accepted | rejected | withdrawn)
 ├── contact: phone, city, country, occupation
 ├── experience: skills_summary, motivation, experience_years, portfolio_url, linkedin_url
 ├── files: cv_asset (FK → MediaAsset), profile_image_asset (FK → MediaAsset)
 ├── availability (JSON: { days: [...] })
 ├── preferred_roles (M2M → VolunteerRole)
 ├── assigned_role (FK → VolunteerRole — set by admin after acceptance)
 └── code_of_conduct_accepted
```

### Registrations Domain
```
PassType
 ├── slug, name, description
 ├── flow (open | approval)
 ├── price_ghs (nullable)
 ├── is_active, is_open_for_registration, is_wired
 └── display: icon, tag, features, cta_label, display_color

PassRegistration
 ├── user (FK → User) — one per user
 ├── pass_type (FK → PassType)
 ├── status (submitted → under_review → approved | rejected | pending_payment → paid | withdrawn)
 ├── job_title, experience_years, organization, organization_website
 └── contribution_statement (required for approval-flow passes)
```

### Payments Domain
```
Donation        — one-off payment from any visitor
Payment         — pass payment (linked to PassRegistration via Paystack)
Withdrawal      — admin records money out
Wallet          — tracked funding pool
Bill            — expected cost
Expense         — actual cost incurred
Goal            — fundraising or budget target
```

### CMS Domain
```
Speaker         — confirmed speakers shown on public site
Sponsor         — confirmed sponsors shown on public site
SponsorshipPackage  — tier packages displayed on sponsor page
SponsorshipBenefitRow — comparison table rows
Section         — CMS page sections (home, etc.) — rich JSON content blocks
ScheduleSession — programme schedule items
MediaAsset      — all uploaded files (photos, CVs, logos)
AttendeeVoice   — testimonial/quote shown on site
```

---

## 5. KEY FLOWS

### A. Public User → Account
```
Anonymous  →  Enter email
           →  Receive OTP (EmailVerification created)
           →  Confirm OTP (signup_token issued)
           →  Set name + password (User created)
           →  Authenticated User
```

### B. Authenticated User → Speaker
```
User  →  Fill 3-step speaker form (SpeakerApplication created, status=submitted)
      →  Admin reviews  (status → under_review)
      →  Admin decides  (status → accepted | rejected)
      →  If accepted: ParticipantInvite(type=speaker) sent
      →  User accepts invite → onboarding flow → confirmed Speaker in CMS
```

### C. Authenticated User → Volunteer
```
User  →  Fill 5-step volunteer form (VolunteerApplication created, status=submitted)
      →  Admin reviews  (status → under_review → interview)
      →  Admin decides  (status → accepted | rejected)
      →  If accepted: Admin assigns a VolunteerRole
```

### D. Authenticated User → Registered Attendee
```
User  →  Select PassType
      →  If flow=open:     Fill professional details → PassRegistration(status=submitted)
                           → If price > 0: Pay via Paystack → status=paid
                           → If free: status=approved
      →  If flow=approval: Fill contribution statement → PassRegistration(status=submitted)
                           → Admin reviews → approved | rejected
                           → If approved + price > 0: Payment triggered
```

### E. Superadmin → Staff Member
```
Superadmin  →  Invite by email + select admin_role (StaffInvite created)
            →  Email sent with invite link
            →  Invitee sets password → User(is_staff=True, admin_role=X) created
```

### F. Staff → Manage Sponsor Lead
```
Sponsor emails inquiry form (SponsorInquiry created, status=new)
→  Submissions Reviewer / Operations / Superadmin sees it in portal
→  Updates status: new → contacted → closed
```

---

## 6. PERMISSION MATRIX

| Action | Anonymous | User | Content Mgr | Submissions | User Mgr | Operations | Finance | Superadmin |
|--------|-----------|------|-------------|-------------|----------|------------|---------|------------|
| View public site | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create account | ✓ | — | — | — | — | — | — | — |
| Submit speaker app | — | ✓ | — | — | — | — | — | ✓ |
| Submit volunteer app | — | ✓ | — | — | — | — | — | ✓ |
| Register for pass | — | ✓ | — | — | — | — | — | ✓ |
| Review speaker apps | — | — | — | ✓ | — | ✓ | — | ✓ |
| Review volunteer apps | — | — | — | ✓ | — | ✓ | — | ✓ |
| Manage CMS content | — | — | ✓ | — | — | ✓ | — | ✓ |
| Manage pass types | — | — | — | — | — | ✓ | — | ✓ |
| Invite staff | — | — | — | — | ✓ | — | — | ✓ |
| Invite participants | — | — | — | — | ✓ | — | — | ✓ |
| View/manage payments | — | — | — | — | — | — | ✓ | ✓ |
| Grant admin roles | — | — | — | — | — | — | — | ✓ |

---

## 7. SECURITY GUARDRAILS

- **Honeypot**: All public forms have a hidden `website` field — any bot that fills it is silently rejected
- **Rate limiting**: Public forms throttled to prevent spam
- **OTP expiry**: Email verification codes expire; resend limited to 60s cooldown
- **Password validation**: Django validators enforce strength (length, common passwords)
- **File validation**: Photos (5MB, image/* only), CVs (10MB, PDF/Word only) — checked both client and server
- **Soft delete**: Users and records are never hard-deleted; they're marked deleted and email is anonymised
- **One registration per user**: `PassRegistration` has a unique constraint per user (one pass only)
- **One application per user**: Both Speaker and Volunteer applications enforce one-per-user
