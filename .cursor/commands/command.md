# Full-stack Firebase build (Cursor command)

You are a senior full-stack engineer and Firebase expert.

A requirement specification document is attached. Use it as the source of truth and follow the workflow below.

---

## 1. Requirements

- Analyze the requirements carefully.
- Summarize key features in a concise list.

---

## 2. Tech stack

Define a clear, modern stack and **justify** each choice (scalability, performance, maintainability):

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (React + TypeScript) |
| Backend | Firebase Cloud Functions (Node.js + TypeScript) |
| Database | Cloud Firestore (NoSQL) |
| Authentication | Firebase Authentication |
| Hosting | Firebase Hosting |
| Storage | Firebase Storage (if needed) |

---

## 3. Architecture (Firebase)

Design a scalable architecture that uses:

- **Firebase Hosting** — frontend deployment
- **Cloud Functions** — backend APIs and business logic
- **Firestore** — data modeling with collections/subcollections
- **Firebase Auth** — secure user management
- **Firebase Storage** — file handling when required

---

## 4. Project structure

Propose a clean, modular layout with clear separation of concerns:

- **UI** — components, pages
- **Services** — API / Firebase logic
- **Config** — Firebase, environment
- **Hooks** — custom React hooks
- **Utils** — helpers
- **Types** — TypeScript interfaces

---

## 5. Implementation practices

- Use environment variables (`.env`) for Firebase config; avoid hardcoding secrets.
- Reusable, scalable components.
- State management: React Context, Zustand, or Redux Toolkit (justify choice).
- API abstraction layer for Firebase calls.

---

## 6. Mobile responsiveness

- **Mobile-first layout** — design for small viewports first, then enhance for tablet and desktop (breakpoints, fluid typography where appropriate).
- **Responsive UI** — use CSS that adapts across breakpoints (Tailwind responsive utilities, CSS modules with media queries, or CSS-in-JS); avoid fixed widths that break on narrow screens.
- **Touch and input** — adequate tap targets (roughly 44×44px minimum), spacing between interactive elements, and support for touch gestures where relevant; avoid hover-only critical actions.
- **Viewport and meta** — correct viewport meta for Next.js / App Router (`metadata` or `viewport` export) so pages scale properly on phones.
- **Navigation** — collapsible menus, bottom nav, or drawer patterns on small screens; keep primary actions reachable without horizontal scroll.
- **Performance on mobile** — lazy loading, image sizing (`next/image` with responsive sizes), and avoid layout shift on load.
- **Testing** — verify layouts at common widths (e.g. 320px, 375px, 768px, 1024px+) and in device emulation or real devices when possible.

---

## 7. Security

- Secure Firebase Authentication (JWT / session handling).
- Role-based access control (RBAC).
- Strict, production-ready Firestore security rules.
- Validate and sanitize all inputs.
- Mitigate XSS, CSRF, and injection risks.
- Restrict API access via Cloud Functions where appropriate.

---

## 8. Firebase Hosting

- Correct `firebase.json` setup.
- Caching and CDN-friendly configuration.
- Optimized build output (SSR/SSG as applicable for Next.js).

---

## 9. CI/CD

- GitHub Actions for build and deploy automation.
- Firebase deploy steps in the pipeline.
- Environment-based deployments (dev / staging / prod).

---

## 10. Logging and errors

- Centralized error-handling strategy.
- Firebase Logging, console, or external logging as appropriate.
- User-facing, graceful error messages.

---

## 11. Testing

- **Unit** — Jest / React Testing Library.
- **Integration** — APIs with Firebase emulators.
- **E2E** — outline a basic approach.
- **Responsive / viewport** — smoke checks or E2E at mobile viewport widths where critical flows differ from desktop.

---

## 12. README

Generate a professional `README.md` including:

- Project name and description
- Tech stack summary
- Features list
- Project structure overview
- Local setup instructions
- Firebase setup steps
- Environment variables
- Scripts (`npm` / `yarn`)
- Deployment (Firebase Hosting)
- CI/CD overview
- Security notes
- How to run tests
- Mobile / responsive behavior (breakpoints, key layout decisions, how to verify on small screens)

---

## Deliverables (output)

Produce the following in your response:

- Architecture overview (text; diagram description if useful)
- Tech stack summary
- Project folder structure
- Step-by-step implementation plan
- Firebase setup (CLI commands)
- **Example starter code** for:
  - Firebase initialization
  - Authentication (login / signup / logout)
  - Firestore CRUD
  - Sample Cloud Function (HTTP API)
  - Hosting config (`firebase.json`)
  - Responsive layout patterns (e.g. flexible grid/stack, mobile nav shell) aligned with section 6
- Firestore security rules (realistic, secure examples)
- CI/CD example (GitHub Actions)
- Deployment notes (dev and production)
- Complete `README.md` content
