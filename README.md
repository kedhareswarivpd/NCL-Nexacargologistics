# NexaCargo — Frontend Application

A production-style frontend for the NexaCargo Global Logistics Platform, built on
**Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4**.

---

## Quick start

```bash
npm install      # requires network access
npm run dev      # http://localhost:3000

npm run build    # production build
npm start
```

> **Network note:** `next build`/`next dev` download the SWC compiler binary and
> fetch Inter / JetBrains Mono via `next/font/google` on first run, so internet
> access is needed the first time. The app was type-checked (`tsc --noEmit`) and
> linted clean in an offline sandbox; the full build was verified to fail *only*
> on those network fetches.

### Demo login

Seeded automatically on first load:

| Email                | Password   | Role  |
| -------------------- | ---------- | ----- |
| `demo@nexacargo.com` | `Demo1234` | Admin |

You can also register a new account — accounts persist in `localStorage`.

---

## What's implemented

### Authentication & state
- **Auth state** via React Context + `useReducer` (`src/context/AuthContext.tsx`),
  rehydrated from `localStorage` so refreshes keep you signed in.
- **Mock auth store** (`src/lib/auth-store.ts`) standing in for a backend:
  register, login, profile update, password-reset request, sessions, with
  simulated latency. Swap this one file for a real API later.
- **Toast notifications** (`src/context/ToastContext.tsx`) with an accessible
  `aria-live` region.

### Pages & routes
| Route | Description | Access |
| --- | --- | --- |
| `/` | Landing page | Public |
| `/services`, `/solutions`, `/products`, `/about` | Marketing pages | Public |
| `/contact` | Contact page with validated form | Public |
| `/track` | Shipment tracking lookup | Public |
| `/login` | Sign in (honours `?next=`) | Public |
| `/register` | Sign up + password-strength meter | Public |
| `/forgot-password` | Password reset request | Public |
| `/dashboard` | Authenticated dashboard | Protected |
| `/profile` | View / edit profile | Protected |
| `/customer/*` | Customer portal | Role: customer, admin |
| `/admin/*` | Admin portal | Role: admin |
| `/driver/*` | Driver portal | Role: driver, admin |

### Features
- **Form validation** — reusable `useForm` hook + composable validators
  (required, email, password strength, confirm-match) with live re-validation.
- **Protected routes** — spinner while auth rehydrates, redirect to
  `/login?next=…`, optional role gating.
- **Conditional navigation** — navbar swaps Login/Register for
  Dashboard/avatar/Sign-out by auth state; responsive mobile menu.
- **Logout** clears session + state and returns home.
- **Loading & error states** on every async action (inline + toast).
- **Accessibility** — labeled inputs with `aria-invalid`/`aria-describedby`,
  `role="alert"` errors, `aria-live` toasts, focus-visible rings,
  `prefers-reduced-motion` guard, `sr-only` helpers.
- **Responsive** across mobile / tablet / desktop.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/            login, register, forgot-password (shared shell)
│   ├── (protected)/       dashboard, profile (auth-gated)
│   ├── (public)/          marketing pages + track
│   ├── (customer|admin|driver)/   role portals (now auth-gated)
│   ├── globals.css        theme tokens, typography, animations
│   └── layout.tsx         root layout + providers
├── components/
│   ├── auth/ProtectedRoute.tsx
│   ├── providers/AppProviders.tsx
│   ├── shared/            PublicNavbar, AuthHeader, ContactForm, Footer…
│   └── ui/                Button, Card, Input, FormField
├── context/               AuthContext, ToastContext
├── hooks/useForm.ts
└── lib/                   types, validation, auth-store, utils
```

---

## Notable decisions & fixes

- **`unstable_instant` intentionally not adopted.** The bundled Next.js 16 docs
  repeatedly suggest exporting `unstable_instant` from every route. It is a real
  (experimental) export, but it requires `cacheComponents: true` and **throws in
  Client Components** — and this app is heavily client-driven, so adopting it
  would break the auth pages.
- **Pre-existing bugs fixed:** root layout imported `Metadata` from `"react"`
  (now `"next"`); `customer/create/page.tsx` used `<ArrowRight>` without
  importing it.
- **Undefined typography utilities defined.** `font-display-lg`, `font-label-caps`,
  etc. were used everywhere but never defined; now in `globals.css`.
- **Two cosmetic lint rules disabled** (`react/no-unescaped-entities`,
  `@typescript-eslint/no-empty-object-type`) so punctuation in existing page copy
  doesn't fail the build. Remaining lint output is non-blocking warnings (mostly
  `<img>` vs `next/image` in the original pages).

## Replacing the mock backend

Components talk to `src/lib/auth-store.ts` and the contexts — never to
`localStorage` directly. To go live, replace the function bodies in
`auth-store.ts` (and the simulated contact/track calls) with real API requests;
no component changes required.
