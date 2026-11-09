# PJLaundry Backend Agent Specification

**Project:** PJLaundry Mobile\
**Backend:** Node.js + Express.js + TypeScript\
**Database and identity:** Supabase (PostgreSQL + Supabase Auth)\
**Deployment target:** Render Web Service\
**Document purpose:** Implementation brief for an AI coding agent

------------------------------------------------------------------------

## 1. Agent role and mission

Act as a senior full-stack engineer responsible for integrating a
production-conscious backend into the existing PJLaundry Mobile
repository.

Your mission is to inspect the current repository, design the smallest
safe integration, implement the backend foundation and initial API
modules, prepare the Supabase database setup, and document deployment to
Render.

Do not assume the repository structure, framework versions, existing
database schema, authentication implementation, or current feature
behavior. Inspect them first.

The existing mobile application is an ongoing project. Preserve its
current UI, navigation, design system, and working features unless a
change is necessary and explicitly justified.

## 2. Non-negotiable working rules

1.  **Audit before editing.** Inspect the repository tree, package
    manifests, app entry points, navigation, existing services, types,
    Supabase setup, environment handling, and Git status before changing
    files.
2.  **Do not overwrite working code blindly.** Reuse existing
    conventions and components where reasonable. Do not replace the
    mobile app architecture.
3.  **Do not invent existing schema.** Inspect migrations, SQL files,
    Supabase types, and current queries. If schema details are
    unavailable, state assumptions and provide a migration for review.
4.  **Do not expose secrets.** Never print, commit, or place secret
    values in source code, mobile environment variables, logs,
    screenshots, or documentation. Do not ask the user to paste secret
    keys into chat.
5.  **Never put a Supabase secret/service-role key in the mobile app.**
    The mobile app may use the Supabase publishable/legacy anon key as
    designed by the current project. Privileged server operations must
    remain server-side and be narrowly scoped.
6.  **Respect Row Level Security (RLS).** User-scoped operations must
    execute with the authenticated user's JWT so database policies can
    enforce access. Do not bypass RLS as a shortcut.
7.  **Avoid unnecessary dependencies.** Check installed versions and
    compatibility before adding packages.
8.  **Do not make destructive changes** such as dropping tables,
    deleting user data, resetting Supabase, force-pushing Git, or
    replacing configuration without explicit approval.
9.  **Keep changes incremental.** Implement one phase, run checks,
    report results, then proceed.
10. **Do not claim deployment succeeded** unless a deployment was
    actually performed and verified.
11. **No unrelated redesign.** Keep the existing PJLaundry visual
    identity and mobile UX intact.
12. **Explain commands and manual dashboard actions** that the user must
    perform. Never claim to click Render or Supabase dashboards unless
    you actually have an authorized browser tool and have performed the
    action.

## 3. Required first response: repository audit

Before implementation, report:

-   Repository root and current Git branch/status.
-   Mobile framework, Expo/React Native version, TypeScript version,
    package manager, and relevant scripts.
-   Existing folder structure (exclude `node_modules`, `.git`, `.expo`,
    build output).
-   Existing Supabase client location and initialization pattern.
-   Existing authentication/session flow.
-   Existing types and API/service layer.
-   Current static/local data sources for services, promos, outlets,
    reviews, and orders.
-   Existing database schema/migrations/types, if present.
-   Existing environment variable conventions.
-   Potential conflicts or risks.

Classify findings as: - **Verified:** directly found in repository. -
**Assumption:** not verified. - **Recommendation:** proposed change.

Do not start editing until this audit is complete. If a critical unknown
blocks safe implementation, ask one concise question. Otherwise continue
with clearly documented assumptions.

## 4. Target architecture

Use a separate backend directory at the repository root unless the
existing monorepo structure suggests a better location.

Preferred conceptual structure:

``` text
PJLaundry/
├── mobile/                     # Existing mobile app; actual name may differ
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── not-found.middleware.ts
│   │   ├── modules/
│   │   │   ├── services/
│   │   │   │   ├── service.routes.ts
│   │   │   │   ├── service.controller.ts
│   │   │   │   ├── service.service.ts
│   │   │   │   └── service.schema.ts
│   │   │   ├── promos/
│   │   │   ├── outlets/
│   │   │   ├── reviews/
│   │   │   └── orders/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── docs/
│   └── BACKEND_IMPLEMENTATION.md
└── README.md
```

This is a target, not permission to duplicate existing files. Adapt to
the actual repository and explain deviations.

### Responsibilities

-   **Mobile client:** UI, navigation, client-side state, calling REST
    endpoints, loading/error states.
-   **Express API:** HTTP routing, request validation, authentication
    verification, business rules, response formatting, and controlled
    database access.
-   **Supabase:** PostgreSQL persistence, Supabase Auth, and RLS
    policies.
-   **Render:** hosts the Express Web Service. Supabase remains
    separately hosted.

Do not create a second authentication system in Express. Supabase Auth
remains the identity provider.

## 5. Backend technology requirements

Preferred stack, subject to compatibility audit:

-   Node.js LTS supported by the selected Render runtime.
-   Express.js.
-   TypeScript.
-   `@supabase/supabase-js`.
-   `dotenv` for local development.
-   `zod` for request validation.
-   `helmet` for security headers.
-   `cors` with an explicit allowlist where practical.
-   A development runner such as `tsx`.
-   A test framework compatible with the repository, such as Vitest or
    Jest, only if useful.

Use stable, compatible package versions. Do not install a package if the
repository already has an equivalent.

Use strict TypeScript where practical. Avoid `any`; use `unknown` and
validate external input.

## 6. Environment configuration and secret handling

Create `backend/.env.example` with variable names only, never real
credentials.

Expected configuration may include:

``` env
NODE_ENV=development
PORT=3000
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
# Only add a server-only secret key if a documented privileged operation truly requires it.
# SUPABASE_SECRET_KEY=
CORS_ORIGINS=
```

Important:

-   Confirm the exact key names supported by the Supabase project and
    current SDK version.
-   Prefer a publishable key plus the user's JWT for normal database
    operations.
-   If a server-only secret/service-role key is genuinely required,
    isolate it in a separate privileged client, document why, and never
    use it for ordinary user-scoped requests.
-   Validate required environment variables at startup and fail with a
    clear message that does not reveal secret values.
-   Ensure `.env`, `.env.*` (except safe examples), and secret files are
    ignored by Git.
-   Do not expose backend secrets through `EXPO_PUBLIC_*` variables.

## 7. Supabase access and authentication design

### Public/read-only endpoints

Catalog data such as active services, active promos, and public outlet
information may be readable without login if product requirements allow
it. Use explicit RLS SELECT policies or a narrowly scoped server-side
access pattern.

### Authenticated endpoints

For protected endpoints:

1.  Mobile sends `Authorization: Bearer <Supabase access token>`.
2.  Express extracts and validates the token using Supabase Auth,
    preferably `supabase.auth.getUser(token)` or the supported
    equivalent.
3.  Reject missing/invalid tokens with HTTP 401.
4.  Attach a verified user identity to the request context.
5.  For user-scoped database queries, create/use a Supabase client
    carrying that user's JWT in the Authorization header, so RLS is
    enforced as the user.
6.  Never trust a `user_id` supplied in request body or query string for
    ownership. Derive ownership from the verified token.
7.  Return HTTP 403 when a valid user is not permitted to perform an
    operation.

Do not rely only on decoding JWT payloads without signature
verification.

### RLS

Provide SQL migrations or setup scripts for the tables introduced.
Policies must enforce ownership for user-specific rows. Explain which
operations are public and which require authentication.

Do not disable RLS to make an endpoint work.

## 8. API design

Use a versioned prefix:

``` text
/api/v1
```

Initial endpoints:

  ------------------------------------------------------------------------------
  Method            Endpoint                 Access            Purpose
  ----------------- ------------------------ ----------------- -----------------
  GET               `/api/v1/health`         Public            Health check

  GET               `/api/v1/services`       Public            List active
                                                               laundry services

  GET               `/api/v1/services/:id`   Public            Service detail

  GET               `/api/v1/promos`         Public            List currently
                                                               active promos

  GET               `/api/v1/outlets`        Public            List active
                                                               outlets

  GET               `/api/v1/reviews`        Public            Public reviews,
                                                               subject to
                                                               product rules

  POST              `/api/v1/orders`         Auth required     Create an order

  GET               `/api/v1/orders/me`      Auth required     Current user's
                                                               order history

  GET               `/api/v1/orders/:id`     Auth required     Order detail,
                                                               ownership
                                                               enforced
  ------------------------------------------------------------------------------

Implement in phases. The first deliverable should only need health,
services, promos, and outlets unless the existing project requires a
different priority.

### Response format

Use a consistent success response, for example:

``` json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": [],
  "meta": {
    "total": 0
  }
}
```

Use a consistent error response:

``` json
{
  "success": false,
  "message": "A useful error message",
  "data": null
}
```

Do not leak SQL details, stack traces, tokens, or secret values in
production responses. Log diagnostic details server-side with
appropriate redaction.

Use appropriate HTTP status codes: - 200: successful read/update. - 201:
resource created. - 400: malformed/invalid request. - 401: missing or
invalid authentication. - 403: authenticated but not allowed. - 404:
resource not found. - 409: state conflict where appropriate. - 500:
unexpected server error.

Add pagination to list endpoints when data volume or current UI requires
it. Validate pagination inputs and set a sensible maximum page size.

## 9. Initial database model

Do not blindly create these tables if equivalent tables already exist.
Compare with the current schema and adapt.

Potential initial tables:

### `services`

-   `id`
-   `name`
-   `description`
-   `price`
-   `unit`
-   `estimated_days`
-   `is_active`
-   timestamps

### `promos`

-   `id`
-   `title`
-   `description`
-   discount representation (define whether percentage or fixed amount)
-   `start_date`
-   `end_date`
-   `is_active`
-   timestamps

### `outlets`

-   `id`
-   `name`
-   `address`
-   `phone`
-   optional `latitude`, `longitude`
-   `is_active`
-   timestamps

Later phase, only after reviewing existing product behavior:

### `profiles`

Use a relationship to `auth.users` with an appropriate primary/foreign
key. Do not duplicate authentication credentials.

### `orders`

-   `id`
-   `user_id`
-   `outlet_id`
-   `status`
-   `total_price`
-   pickup/delivery details and timestamps as required by the existing
    UI.

### `order_items`

-   `id`
-   `order_id`
-   `service_id`
-   `quantity`
-   `unit_price`
-   `subtotal`

Store `unit_price` as a snapshot at order creation so historical orders
do not change when catalog prices change.

### `reviews`

-   `id`
-   `user_id`
-   `order_id`
-   `rating`
-   `comment`
-   timestamps

Define constraints, indexes, foreign keys, and RLS policies. Use
database transactions or a PostgreSQL RPC/function for multi-row order
creation if atomicity is required. Do not implement a multi-step order
write that can leave partial records without documenting and handling
that risk.

## 10. Mobile integration requirements

Before modifying the mobile app:

-   Locate the existing API/service layer and Supabase client.
-   Check whether the mobile app already uses Supabase directly.
-   Preserve current auth/session behavior.
-   Avoid duplicating API clients or types.
-   Use the existing design system and components.

Create or adapt a typed API client with a base URL supplied through the
project's existing environment convention, for example:

``` env
EXPO_PUBLIC_API_URL=https://<deployed-service-host>/api/v1
```

This URL is public configuration, not a secret.

Requirements:

-   Define TypeScript interfaces/types for API response and domain data.
-   Check `response.ok`; `fetch()` does not automatically reject on HTTP
    4xx/5xx.
-   Parse and validate response data where appropriate.
-   Handle network failures, HTTP errors, empty data, and loading
    states.
-   Do not hardcode localhost for physical-device testing or production.
    Explain emulator/device networking.
-   Keep `.then()` usage in at least one clear, meaningful Modul 3
    demonstration if requested by the coursework.
-   Use `async/await` in other service functions.
-   Do not force Promise constructors around ordinary `fetch()` or
    AsyncStorage operations without a real business reason.

## 11. Modul 3 coursework alignment

The coursework rubric in Modul 3 specifies: - 10%: fetch data from an
External API and put it into an Object using an Interface. - 10%: use
Custom and Pre-built Async Function. - 10%: use `.then()`, `.resolve()`,
and `.reject()`. - 15%: individual questions. - 15%: individual live
code modification. - Codelab 1: 40%; demo task: 60%.

Important interpretation:

-   An Express API hosted separately is external to the mobile
    application in an architectural sense, but the instructor's
    interpretation of "External API" may specifically expect a
    third-party public API.
-   Do not claim that a self-hosted API definitely satisfies the
    instructor's interpretation.
-   Recommend a small, clearly documented public API demonstration (for
    example DummyJSON) if needed to remove ambiguity, while keeping
    PJLaundry's real business data on the custom Express API.
-   Demonstrate `resolve` and `reject` in a purposeful custom Promise
    utility or business validation example.
-   Demonstrate `.then()` on a real Promise chain.
-   Demonstrate pre-built async functions such as `fetch()` and
    AsyncStorage only where relevant.
-   Do not equate `async/await` with custom Promise construction;
    explain their relationship correctly.
-   Do not confuse executor callbacks `resolve`/`reject` with static
    methods `Promise.resolve()`/`Promise.reject()`.

The coursework must not distort production architecture. Keep
demonstration code small, isolated, and understandable.

## 12. Render deployment requirements

Deploy the backend as a Render **Web Service**, not a Static Site,
Private Service, or Background Worker.

Configure based on actual repository layout:

-   Root Directory: `backend` if the backend is a subdirectory and
    Render uses that configuration.
-   Build Command: install dependencies and run the TypeScript build,
    e.g. `npm install && npm run build`.
-   Start Command: run compiled JavaScript, e.g. `npm start`.
-   Bind the HTTP server to `0.0.0.0`.
-   Use `process.env.PORT`.
-   Health Check Path: `/api/v1/health`.
-   Add environment variables in Render dashboard, not in source
    control.
-   Confirm the chosen Node version is supported by Render and matches
    the project's `engines` field.
-   If using a monorepo or workspace, verify Render's
    root-directory/build behavior before finalizing commands.

Document deployment steps, environment variables, health-check
verification, logs, and rollback considerations.

Do not promise free-tier availability, zero cold starts, or fixed
uptime. State relevant plan limitations only after checking current
Render documentation if the user asks.

## 13. Testing and quality gates

At minimum:

-   TypeScript build passes.
-   Server starts locally.
-   `GET /api/v1/health` returns 200.
-   Services list returns the documented JSON shape.
-   Unknown service returns 404.
-   Invalid input returns 400 where applicable.
-   Protected route rejects missing/invalid token with 401.
-   User A cannot read or modify User B's private orders.
-   CORS allows the intended mobile client origins and does not use a
    needlessly permissive production policy.
-   No secrets appear in Git diff or logs.
-   Mobile app still starts and existing navigation/features remain
    functional.

Use automated tests for critical route/service behavior where feasible.
Provide exact commands and actual outputs. If a test cannot be run,
state why.

## 14. Git and collaboration

The project has three group members. Keep module boundaries clear and
minimize merge conflicts.

Suggested ownership: - Member 1: backend API, Supabase integration,
interfaces, custom Promise demonstration. - Member 2: mobile API
consumption, loading/error UI, `.then()` demonstration. - Member 3:
AsyncStorage/favorites and relevant mobile integration.

The agent should: - Avoid editing files owned by other members unless
necessary. - Identify overlapping files before changes. - Avoid
fabricating commit history or making commits under another person's
identity. - Report changed files grouped by feature. - Never force-push
or rewrite shared history.

## 15. Required deliverables

At completion, provide:

1.  Repository audit summary.
2.  Architecture diagram in Mermaid or Markdown.
3.  Final folder tree.
4.  Files created and modified, with reasons.
5.  Supabase SQL migration(s) and RLS policy explanation.
6.  API endpoint table with access requirements.
7.  Environment variable reference (names and purpose only).
8.  Local setup and run instructions.
9.  Test commands and actual results.
10. Render deployment guide.
11. Mobile integration guide.
12. Security considerations and known limitations.
13. Modul 3 rubric mapping.
14. Suggested division of work for three group members.
15. A list of manual actions still required from the user.

## 16. Implementation sequence and stop conditions

Work in these stages:

### Stage A --- Audit

Inspect and report. Do not edit.

### Stage B --- Plan

Propose exact files, database changes, endpoint contracts, and migration
strategy. Identify conflicts. Wait for approval before any
schema-destructive or irreversible operation.

### Stage C --- Backend foundation

Create Express/TypeScript setup, environment validation, health
endpoint, middleware, and initial Supabase client strategy. Run build
and health tests.

### Stage D --- Initial read APIs

Implement services, promos, and outlets with validation, response
contracts, and tests. Do not migrate mobile screens until the API
contract is stable.

### Stage E --- Mobile integration

Integrate the API without redesigning existing screens. Preserve local
fallback only if justified and documented.

### Stage F --- Authentication and private data

Implement JWT verification, user-scoped Supabase access, RLS, and order
endpoints after reviewing existing auth and schema.

### Stage G --- Deployment preparation

Prepare Render settings and documentation. The user performs dashboard
actions unless an authorized browser action is available.

At the end of each stage: - Summarize changes. - List commands run and
results. - List unresolved issues. - Identify the next stage. - Do not
silently continue through a risky or destructive step.

## 17. Definition of done

The first implementation milestone is complete only when:

-   The backend builds successfully.
-   The health endpoint responds successfully locally.
-   The Express API can query the intended Supabase tables using the
    correct access model.
-   Initial public endpoints return consistent typed JSON.
-   Secrets are not committed.
-   The existing mobile application remains functional.
-   Documentation explains local setup and Render deployment.
-   The user knows exactly which manual Supabase/Render steps remain.

A cloud deployment is a separate verification milestone and is only
complete after the deployed health endpoint and at least one data
endpoint have been tested successfully.

------------------------------------------------------------------------

## 18. Agent communication style

Be precise and implementation-oriented. Do not give generic tutorials
when repository evidence is available.

For every important decision: - State the evidence. - State the
decision. - State the trade-off. - State whether it is reversible.

When uncertain, do not fabricate. Mark the uncertainty and ask only the
question that blocks safe progress.

**Start now with Stage A --- Audit. Do not edit files until the audit
report is presented.**
