# nexusEPM ERP Consultant Academy

<img src="public/brand/nexusepm-logo.png" alt="nexusEPM" height="36">

A web training portal that turns beginners into job-ready **Odoo techno-functional consultants**. Trainees learn in this order:

> Understand the business → understand the ERP process → learn the Odoo apps → configure → import data → execute transactions → test → customize → implement → support.

This is the **MVP release**. It runs as a working application and ships with seeded content: 12 courses with 105 lessons, 6 end-to-end business processes, 5 configuration-lab scenarios, 5 import templates with a validation simulator, a complete trading-company implementation project, and a 16-document implementation handbook.

---

## Quick start

Requires **Node.js 20+** (tested on Node 24). You do **not** need to install PostgreSQL to run it locally; see [Database](#database).

```bash
npm install
npm run setup      # runs migrations and seeds content + demo accounts
npm run dev        # http://localhost:3000
```

Demo accounts (development only; they are also shown on the login page):

| Role    | Email                  | Password         |
|---------|------------------------|------------------|
| Student | student@academy.test   | StudentDemo2026  |
| Trainer | trainer@academy.test   | TrainerDemo2026  |
| Admin   | admin@academy.test     | AdminDemo2026    |

For any shared environment, set `SEED_*_PASSWORD` (see `.env.example`). Seeding refuses to run in production without them.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js development server, production build, production server |
| `npm run setup` | `db:migrate` followed by `db:seed` |
| `npm run db:generate` | Generates a new SQL migration after you change `src/lib/db/schema.ts` |
| `npm run db:migrate` | Applies the migrations in `drizzle/` |
| `npm run db:seed` | Inserts content that is missing. Content that admins have edited is kept. |
| `npm run db:seed -- --refresh=odoo-accounting,odoo-sales` | Updates the listed courses in place from their content files. Learner progress, notes and attempts are kept; admin edits to those courses are overwritten. |
| `npm run db:seed -- --force` | Rebuilds all seeded content. **This deletes the progress linked to that content.** |
| `npm test` | Vitest: unit tests plus an end-to-end workflow test against in-memory PostgreSQL |
| `npm run typecheck` | `tsc --noEmit` |

---

## What's in the MVP

| # | Navigation item | Status |
|---|---|---|
| 1 | Dashboard | Current learning path, completed and pending lessons, scores, practical steps, project progress, skills, recommended next lesson, trainer feedback |
| 2 | ERP Fundamentals | 11 lessons with flashcards, a 15-question assessment and a case-study assignment |
| 3 | Business Process Academy | O2C, P2P, Inventory, R2R, Plan-to-Produce and Project-to-Profit. Each has an interactive workflow, stakeholders, documents, data, approvals, accounting and inventory impact (with journal entries), risks, KPIs, reports, Odoo handling, a worked scenario and a quiz |
| 4 | Odoo Application Training | CRM, Sales, Purchase, Inventory, **Accounting (including an India module: GST, IRN e-invoicing, e-way bill, GSTR returns, TDS/TCS)**, **Manufacturing (MRP)** and **eCommerce & E-Invoicing for online retail** (Peppol, UBL/Factur-X, country EDI). Each follows the 16-point application template, with assessments and assignments |
| 5 | Implementation Methodology | Intro plus 9 phases, each with a reusable template |
| 6 | Business Configuration Lab | Trading (12 steps), manufacturing, services, retail and multi-company. Checklists unlock in dependency order |
| 7 | Data Migration & Import Lab | XLSX/CSV templates with a field guide, the dependency order, a validation simulator (upload, paste or generate), a cleansed-file export, a reconciliation report, and a sample data generator with optional error injection and an answer key |
| 8 | Technical Development Lab | 18 lessons building a module step by step (Odoo 17, with 18.0 notes) |
| 9 | Integration Lab | 12 lessons: REST, auth, secrets, webhooks, the Odoo external API (XML-RPC/JSON-RPC, 19.0 JSON-2 notes), retries, idempotency and reconciliation |
| 10 | Testing & QA | 10 lessons plus a personal **test register** (12-column template, result recording, summary, CSV export) |
| 11 | Real-Time Business Projects | **Project A: trading company**, complete. Projects B–E appear as planned |
| 12 | Assessments & Certifications | Course finals and process quizzes, best-score tracking, and automatic certificates (all lessons done and score ≥ the course threshold) |
| 13 | Documentation Library | Glossary, references and 12 templates; printable |
| 14 | Progress & Reports | Completion chart, lab progress, score history, bookmarks and notes; printable |
| 15 | Admin & Trainer Management | Trainer dashboard (charts, trainee table, review queue, open questions, per-student feedback). Admin console (users and roles, publish/hide courses, certificate thresholds, lesson editor, ERP platforms, AI retention) |
| — | AI Learning Assistant | Grounded in portal content, version/edition/app aware, with 7 modes. Runs offline when no key is configured |
| — | Discussions | Questions per lesson or general, replies, resolve/reopen |
| — | Search | PostgreSQL full-text search over lessons, processes and docs |

**Labels.** Every lesson states the Odoo version(s) it applies to and its feature scope: *Standard*, *Configuration*, *Enterprise only*, *Custom development* or *Third-party*. Statements the content authors could not verify for every version or edition are marked "(verify in your training instance)".

**Simulation vs reality.** The configuration lab and the import simulator **never connect to or modify an Odoo database**. The UI says this wherever it applies. Trainees carry out the real steps in their own Odoo *training* database.

---

## Visual learning

Lessons can embed interactive visuals (process flows, decision trees, annotated Odoo mockups, comparisons, knowledge checks…) as `visual-*` blocks in their Markdown, and every lesson gets automatic enhancements (takeaway cards, callouts, outline). See [docs/visual-learning/README.md](docs/visual-learning/README.md) for the audit, plan, design system, authoring guide, Napkin AI workflow and rollout steps. Check assets with `npm run visuals:check`.

## Architecture

```
src/
  app/
    (auth)/login, register          public pages
    (portal)/…                      authenticated pages (layout enforces session)
    actions/                        server actions (auth, learning, testing, assignments, admin)
    api/                            route handlers (templates, import validation, sample data,
                                    project files, submissions, test export, assistant)
  components/                       reusable UI (ui.tsx primitives, markdown, quiz, flow diagram,
                                    import simulator, generator, charts, forms)
  content/                          typed seed content (types.ts is the content contract)
  lib/
    db/schema.ts, client.ts         Drizzle ORM schema (PostgreSQL) + driver selection
    auth/                           password hashing, sessions, RBAC permission matrix
    services/                       domain logic (pure functions taking a db handle; unit-testable)
    import/                         templates, CSV/XLSX, validator, generator
    ai/assistant.ts                 server-side AI provider + guardrails
drizzle/                            SQL migrations
scripts/                            migrate.ts, seed.ts
tests/                              vitest suites
```

- **Stack:** Next.js 15 (App Router, server actions), TypeScript, Tailwind CSS v4, Drizzle ORM, PostgreSQL, Recharts, lucide icons.
- **Multi-ERP ready.** The `erp_platforms` table holds Odoo (active) and SAP B1, S/4HANA, Dynamics 365 and NetSuite (planned). Courses reference a platform, so a new ERP track is new content plus a platform row; the portal itself needs no redesign.
- **Content workflow.** Content is authored as typed TypeScript in `src/content/**` and seeded into the database. After seeding, the database is the source of truth and admins edit lessons in **Admin ▸ Edit lessons**. Markdown is rendered without raw HTML, so edited content cannot inject scripts.

### Data model (main entities)

`users`, `sessions`, `erp_platforms`, `learning_paths`, `learning_path_courses`, `courses`, `course_modules`, `lessons`, `lesson_resources`, `business_processes`, `exercises`, `exercise_steps`, `student_exercise_steps`, `assessments`, `questions`, `assessment_attempts`, `student_answers`, `assignments`, `submissions`, `projects`, `project_tasks`, `student_project_tasks`, `lesson_progress`, `bookmarks`, `notes`, `certificates`, `trainer_feedback`, `discussions`, `doc_resources`, `test_cases`, `ai_conversations`, `ai_messages`.

All tables have UUID primary keys, foreign keys with explicit `ON DELETE` behaviour, timestamps, and indexes on lookup paths. Unique constraints cover case-insensitive email, slugs, one certificate per user and course, and one note per user and lesson. See `src/lib/db/schema.ts` and `drizzle/0000_init.sql`.

### Database

`src/lib/db/client.ts` chooses the driver at runtime:

- **`DATABASE_URL` set:** real PostgreSQL through `node-postgres`. Use this for production, CI and shared development.
- **Not set:** **PGlite**, PostgreSQL 18 compiled to WASM, persisted in `.data/pglite`. Same SQL, same migrations, nothing to install. PGlite allows **one process at a time**, so stop `npm run dev` before running `db:seed`.

### Security

- Passwords are hashed with bcrypt and must be at least 10 characters with letters and digits.
- Sessions use random 256-bit tokens. Only their SHA-256 hash is stored. The cookie is httpOnly and SameSite=Lax (Secure in production), with a 7-day expiry.
- Middleware does a cheap cookie check. Every page, action and API route checks the session server-side, and roles are checked through one permission matrix (`lib/auth/rbac.ts`).
- Login and registration are rate-limited. Login returns a generic error message.
- The quiz answer key is never sent to the browser before submission.
- Uploads are capped at 5 MB, restricted by extension, and stored outside `/public`. They download only through an authorised route, for the owner or a trainer.
- CSV exports are protected against formula injection.
- `OPENAI_API_KEY` is read on the server only. Assistant conversations expire after `AI_RETENTION_DAYS`, users can delete them, and admins can purge them.
- The rate limiter is in-memory. Use a shared store such as Redis if you run more than one instance.

---

## Configuration

Copy `.env.example` to `.env.local`. Key variables: `DATABASE_URL`, `SEED_*_PASSWORD`, `ALLOW_SELF_REGISTRATION`, `STORAGE_DIR`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `AI_RETENTION_DAYS`, `COOKIE_SECURE`.

## Deployment

1. Provision PostgreSQL (managed: Neon, Supabase, RDS, Cloud SQL, Azure) and set `DATABASE_URL`.
2. Set the `SEED_*` passwords, `OPENAI_API_KEY` (optional) and `STORAGE_DIR`. Use persistent storage, or replace `src/lib/storage.ts` with S3/GCS/Azure Blob on platforms whose disks are ephemeral.
3. `npm ci && npm run build && npm run setup && npm start`. You can run `setup` as a release step instead.
4. Enable automated database backups, keep HTTPS on (session cookies are Secure), and send logs to your platform's log service.
5. Keep the Odoo practice environment **separate**: a dedicated Odoo test instance or Odoo.sh staging branch, never a production database.

## Testing

`npm test` runs 38 tests:

- **Import lab:** CSV parsing and escaping; every validator rule; dependency order; Project A's master data files validate cleanly in sequence; generator determinism and error injection.
- **Units:** quiz grading, RBAC, password policy, test summaries, AI prompt guardrails, and seed-content integrity (unique slugs, valid answer keys, scope/version labels on every lesson, step dependencies).
- **Workflow (real PostgreSQL via in-memory PGlite):** migrate, seed, register, log in with a session, get a next-lesson recommendation, complete a lesson, try lab steps (blocked by dependency), fail then pass a quiz, earn a certificate, track project tasks, load test cases, see the trainee in the trainer overview, run full-text search, and confirm that seeding is idempotent and that an in-place course refresh keeps progress.

## Roadmap (next increments)

- Projects B–E (manufacturing, services, multi-company, legacy migration) using the existing `ProjectContent` contract.
- Remaining Odoo apps (Project, Timesheets, Expenses, HR, Helpdesk, POS, eCommerce and others) and additional process walkthroughs.
- More import templates: UoM, pricelists, BoMs, opening AR/AP, opening journal balances, employees, projects/tasks.
- An optional connection to a live Odoo **training** instance for guided verification (read-only checks first).
- Email notifications for trainer feedback and answered questions; cohort management.

## Branding & copyright

© NEXUSEPM Consulting Private Limited. All rights reserved. — [nexusepm.com](https://www.nexusepm.com/)

Branding (company name, legal name, logo, website) is configured in one place: `src/lib/brand.ts`. The logo lives at `public/brand/nexusepm-logo.png` and the app icons at `src/app/icon.png` / `src/app/apple-icon.png`. Colour tokens (nexusEPM navy and cyan) are in `src/app/globals.css`.

> Odoo is a trademark of Odoo S.A. This academy is independent training material and not affiliated with Odoo S.A. All companies and data are fictional.
