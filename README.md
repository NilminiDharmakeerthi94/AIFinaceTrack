# LedgerLite — Personal finance tracker

LedgerLite is a **mobile-first** web app for tracking income and expenses, organizing **categories**, setting **monthly income / budget / savings targets**, and viewing **summaries and charts**. It matches the hackathon specification: Firebase-backed persistence, email/password auth, CRUD for transactions, a rich **landing overview**, and an **insights dashboard** with charts.

> **Note:** This repo also contains a legacy **Angular + Express** sample under `frontend/` and `backend/`. The product described here lives in **`web/`** (Next.js) with **`functions/`** (Cloud Functions) and root Firebase config.

---

## Features (from requirements)

- Manual **income** and **expense** entry with notes and dates  
- **Categories** (seeded defaults: Food, Transport, Bills, Entertainment, Other) with create / edit / delete  
- **Profile**: monthly income, monthly budget cap, savings target  
- **Landing (signed in)**: month totals, balance, budget usage %, category breakdown, simple heuristic **insights**  
- **Dashboard**: category mix (pie), monthly expense bars, trend line  
- **Firebase Authentication** (email/password)  
- **Firestore** storage for profile, categories, and transactions  
- **Callable Cloud Function** `monthlySummary` for server-side aggregation (optional “Sync API” on desktop dashboard)  
- **Responsive UI**: bottom navigation on small screens, sidebar from `sm` breakpoint, 44px tap targets, viewport meta via Next.js `viewport` export  

---

## Tech stack

| Layer | Choice | Why |
|--------|--------|-----|
| **Frontend** | Next.js 15 (App Router) + React 19 + TypeScript | Strong defaults for routing, static export, and DX; easy hosting on Firebase Hosting. |
| **Styling** | Tailwind CSS | Fast responsive layouts, mobile-first breakpoints, consistent spacing. |
| **State** | React Context (auth only) | Auth is global and simple; finance data is loaded per-page via hooks—no heavy client store needed. |
| **Backend** | Cloud Functions (Node 20, TypeScript) | Keeps secrets off the client; validates Firebase ID tokens for callable APIs. |
| **Database** | Cloud Firestore | Real-time friendly, flexible model for nested `users/{uid}/…` data. |
| **Auth** | Firebase Authentication | Managed passwords, ID tokens for rules and Functions. |
| **Hosting** | Firebase Hosting | CDN, cache headers, serves static `web/out` with SPA-style rewrites. |
| **Charts** | Recharts | Accessible charts for category and monthly trends. |

---

## Architecture (Firebase)

```text
[Browser: Next.js static export]
        │  Firebase Web SDK (Auth + Firestore + Functions)
        ▼
[Firebase Auth] ─────────────────────────────────────────┐
        │                                                 │
        ▼                                                 ▼
[Cloud Firestore]                              [Cloud Functions]
  users/{uid}                                   monthlySummary (onCall)
  users/{uid}/categories/{id}                        │
  users/{uid}/transactions/{id}                       └── reads same Firestore paths
        │
        ▼
[Firebase Hosting] → CDN → `web/out` (HTML/JS/CSS)
```

- **Security**: Firestore rules enforce **owner-only** access and validate shapes (amounts, strings, types). Users cannot change `role` away from `user`.  
- **Client**: Services under `web/services/` abstract Firestore calls.  
- **Functions**: Trusted aggregation for demos and future server-only logic.  

---

## Project structure

```text
Sample/
├── web/                      # Next.js app (primary UI)
│   ├── app/                  # App Router pages (landing, login, dashboard, …)
│   ├── components/           # UI (shell, charts, meters)
│   ├── config/               # Firebase public config helpers
│   ├── context/              # Auth provider
│   ├── hooks/                # useFinanceData, useRequireAuth
│   ├── lib/                  # Firebase singletons
│   ├── services/             # Firestore + summary + callable API
│   ├── types/                # Shared TS types
│   └── utils/                # Money / date helpers (+ unit tests)
├── functions/                # Cloud Functions (TypeScript → lib/)
├── firebase.json             # Hosting, Firestore, Functions
├── firestore.rules           # Production-oriented rules
├── firestore.indexes.json    # Add composite indexes if the console prompts
├── .github/workflows/        # CI + manual deploy
├── frontend/                 # Legacy Angular (not used by LedgerLite)
└── backend/                  # Legacy Express (not used by LedgerLite)
```

---

## Local setup

### Prerequisites

- Node.js **20** (recommended; CI uses 20)  
- Firebase CLI (`npm i -g firebase-tools`) for deploy/emulators  
- A Firebase project with **Authentication (Email/Password)** and **Firestore** enabled  

### 1. Install dependencies

```bash
cd web
npm ci
cd ../functions
npm ci
```

### 2. Environment variables (web)

Copy `web/.env.example` to `web/.env.local` and fill values from **Firebase Console → Project settings → Your apps (Web)**.

Do **not** commit `.env.local`. The app only uses **`NEXT_PUBLIC_*`** keys (safe for browser bundle); secrets belong in Functions config/Secret Manager for future APIs.

### 3. Run Next.js locally

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Emulators (optional)

```bash
firebase emulators:start
```

Point the web app at emulator hosts via Firebase SDK environment if you extend the project for integration tests.

---

## Firebase CLI setup & deploy

```bash
firebase login
firebase use --add          # select your project
firebase deploy --only firestore:rules
firebase deploy --only functions
cd web && npm run build && cd ..
firebase deploy --only hosting
```

Or one shot (after builds):

```bash
cd web && npm ci && npm run build && cd ../functions && npm ci && npm run build && cd .. && firebase deploy
```

### Hosting note

`firebase.json` publishes **`web/out`** (Next **static export**). Rebuild the web app before every Hosting deploy.

---

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `web/` | `npm run dev` | Local dev server |
| `web/` | `npm run build` | Production export → `web/out` |
| `web/` | `npm run lint` | ESLint (Next) |
| `web/` | `npm test` | Jest unit tests |
| `functions/` | `npm run build` | Compile TS → `lib/` |
| root | `firebase deploy` | Rules, Functions, Hosting |

---

## CI/CD

- **`.github/workflows/ci.yml`** — on push/PR to `main` or `develop`: builds `web`, runs tests, builds `functions`.  
- **`.github/workflows/deploy-firebase.yml`** — manual `workflow_dispatch`; requires GitHub secrets:  
  - `FIREBASE_TOKEN` — from `firebase login:ci`  
  - All `NEXT_PUBLIC_FIREBASE_*` vars used at build time  

**Environments:** Use separate Firebase projects (or Hosting channels) for dev/staging/prod; map with `firebase use` aliases in `.firebaserc`.

---

## Security notes

- Firestore rules restrict data to `request.auth.uid === userId` and validate payloads (see `firestore.rules`).  
- Cloud Function `monthlySummary` requires a valid Firebase ID token (`onCall` default).  
- Sanitize inputs on the client (length limits) and enforce bounds again in rules.  
- Static hosting has **no server-side cookies**; rely on Firebase Auth session in the browser.  
- For XSS: avoid `dangerouslySetInnerHTML`; React escapes by default.  

---

## Testing

- **Unit:** `cd web && npm test` — Jest + Testing Library setup via `next/jest`.  
- **Integration:** Use Firebase emulators + mock auth for service-layer tests (outline).  
- **E2E:** Playwright/Cypress against emulators or a staging project (outline).  
- **Responsive:** Chrome DevTools device mode at **320px, 375px, 768px, 1024px**; verify bottom nav, forms, and charts scroll without horizontal overflow.  

---

## Mobile / responsive behavior

- **Layout:** Single column, `max-w-3xl` content, **fixed bottom navigation** on `< sm`, **sidebar** on `≥ sm`.  
- **Touch:** Buttons use `min-h-[44px]` where critical (`tap-target` utility).  
- **Viewport:** Set in `web/app/layout.tsx` via `export const viewport`.  
- **Images:** `next.config.ts` uses `images.unoptimized` for static export; use responsive widths if you add assets later.  

---

## Implementation plan (high level)

1. Model Firestore: `users/{uid}`, subcollections `categories`, `transactions`.  
2. Ship Auth (email/password) + guarded routes via `useRequireAuth`.  
3. Build CRUD UI for transactions and categories; seed default categories.  
4. Landing summary + budget meter + insights heuristics.  
5. Dashboard charts from recent transaction history.  
6. Add callable `monthlySummary` for server aggregation.  
7. Tighten rules, CI, Hosting cache headers, README.  

---

## License

Private / hackathon use unless you add a license.
