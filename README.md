# MEDIDESK

MEDIDESK is a unified healthcare management frontend for patient, doctor, and hospital administrator workflows. It is built with React, TypeScript, Vite, Tailwind CSS, React Router, Lucide, and Recharts.

## Run locally

```bash
pnpm install
pnpm dev
```

The Preview runtime uses port `3000`. Production checks:

```bash
pnpm typecheck
pnpm build
```

## Demo workspaces

Open `/login` and choose a demo workspace:

- **Patient** — health overview, doctors, booking, appointments, records, prescriptions, lab reports, messages, notifications, settings.
- **Doctor** — appointment management, patient records, prescriptions, lab reports, availability, reviews, earnings, messages, settings.
- **Admin** — hospital dashboard, doctor/patient/staff management, departments, beds, appointments, revenue, analytics, reports, messages, settings.

The role switcher in the profile menu is a front-end demo convenience.

## API readiness and security

Demo data lives in `src/data.ts`, while replaceable typed service boundaries live in `src/services/index.ts`. Browser-safe environment variable names are documented in `.env.example`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

This demo never stores raw passwords, service-role keys, MongoDB credentials, or medical records in browser storage. MongoDB should be accessed only through a backend/API layer. Frontend route protection is not the security boundary for medical data; production authorization, database rules, encryption, audit logging, and authenticated APIs must enforce access independently.

## Design system

The design system uses a calm clinical canvas, deep medical navy, Clinical Teal, Pulse Mint, calm status colors, restrained shadows, 8px spacing, reusable cards/buttons/badges, shared charts, and a responsive sidebar/header shell. Interactive surfaces use gentle lift, teal focus rings, contextual hover feedback, and reduced-motion support. The pulse-mark MEDIDESK logo is available at `public/medidesk-logo.svg` and the route manifest is available at `public/manus-routes.json`.
