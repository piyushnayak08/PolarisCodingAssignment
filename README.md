# Polaris Coding Assignment - Playwright Test Framework

A scalable Playwright + TypeScript test framework for the Practice Software Testing application, designed for both local execution and CI/CD pipelines.

## What this framework delivers
- Separate UI and API test layers with independent execution paths.
- Reusable custom fixtures and page objects for maintainable automation.
- Environment-driven target switching (`main` vs `buggy`) through `.env` values.
- Visual regression tests to compare critical UI regions between main and buggy deployments.
- Multi-reporter outputs (`list`, `html`, `junit`, `json`) for local and CI analysis.
- GitHub Actions workflow running UI and API suites as separate jobs, across both targets.
- Bug documentation pattern in `BUGS.md`.

## Tech stack
- `@playwright/test`
- `TypeScript`
- `dotenv`

## Framework structure
```text
.
├── .github/workflows/playwright.yml
├── .env.example
├── BUGS.md
├── playwright.config.ts
├── src
│   ├── config/env.ts
│   ├── data/accounts.ts
│   ├── fixtures
│   │   ├── api.fixture.ts
│   │   └── ui.fixture.ts
│   ├── pages
│   │   ├── auth.page.ts
│   │   ├── checkout.page.ts
│   │   ├── home.page.ts
│   │   ├── orders.page.ts
│   │   ├── product.page.ts
│   │   └── visual-regression.page.ts
│   ├── types/models.ts
│   └── utils
│       ├── api-client.ts
│       ├── currency.ts
│       └── random.ts
└── tests
    ├── api
    │   ├── auth-cart-orders.api.spec.ts
    │   └── catalog.api.spec.ts
    └── ui
        ├── account-cart-checkout.ui.spec.ts
      ├── bug-hunt-regressions.ui.spec.ts
      ├── catalog.ui.spec.ts
      └── visual-regression.ui.spec.ts
```

## Coverage mapping to user stories
- `US1, US2, US3, US4, US10`: [tests/ui/catalog.ui.spec.ts](tests/ui/catalog.ui.spec.ts)
- `US5, US6, US7, US8, US9`: [tests/ui/account-cart-checkout.ui.spec.ts](tests/ui/account-cart-checkout.ui.spec.ts)
- API validations for catalog/auth/cart/orders:
  - [tests/api/catalog.api.spec.ts](tests/api/catalog.api.spec.ts)
  - [tests/api/auth-cart-orders.api.spec.ts](tests/api/auth-cart-orders.api.spec.ts)

Each story includes a positive and a negative/edge case path.

## Default test accounts
Configured in [src/data/accounts.ts](src/data/accounts.ts):
- John Doe (`admin@practicesoftwaretesting.com` / `welcome01`)
- Jane Doe (`customer@practicesoftwaretesting.com` / `welcome01`)
- Jack Howe (`customer2@practicesoftwaretesting.com` / `welcome01`)
- Bob Smith (`customer3@practicesoftwaretesting.com` / `pass123`)

## Local setup
1. Install dependencies:
```bash
npm ci
```
2. Copy environment template and set values if required:
```bash
copy .env.example .env
```
3. Install browsers:
```bash
npm run pw:install
```

## Run tests locally
- Full suite:
```bash
npm test
```
- UI only:
```bash
npm run test:ui
```
- Visual only:
```bash
npm run test:visual
```
- API only:
```bash
npm run test:api
```
- UI against buggy app:
```bash
npm run test:buggy:ui
```
- API against buggy app:
```bash
npm run test:buggy:api
```

## Visual regression testing (what and how)

### What this validates
- Header visual consistency (top navigation, labels, language control visibility).
- Catalog filters panel consistency (sort label, category/brand panel shape, key visual drift).

The tests are implemented with a dedicated page object in [src/pages/visual-regression.page.ts](src/pages/visual-regression.page.ts) and spec file [tests/ui/visual-regression.ui.spec.ts](tests/ui/visual-regression.ui.spec.ts).

### How it works
1. Create baseline snapshots from main target once.
2. Compare main target against the same snapshots to confirm stability.
3. Compare buggy target against the same snapshots to expose visual regressions.

### Commands
1. Create or refresh baseline snapshots (main target):
```bash
npm run test:visual:update:main
```
2. Validate main target against baseline:
```bash
npm run test:visual:compare:main
```
3. Validate buggy target against baseline:
```bash
npm run test:visual:compare:buggy
```

### How to read failures
- Playwright will show a diff for each visual mismatch.
- Expected result:
  - Main compare should pass after baseline refresh.
  - Buggy compare should fail when UI drift exists (for example typo labels, missing controls, layout differences).

### Artifacts and debugging
- HTML report: `playwright-report/`
- For failing tests, inspect screenshot diffs and traces in `test-results/`.
- For trace replay:
```bash
npx playwright show-trace <path-to-trace.zip>
```

## Reports
- HTML report: `playwright-report/`
- JUnit XML: `test-results/junit/results.xml`
- JSON report: `test-results/json/results.json`

Open HTML report:
```bash
npm run report:open
```

## CI/CD execution (GitHub Actions)
Workflow file: [.github/workflows/playwright.yml](.github/workflows/playwright.yml)

### Pipeline design
- Matrix on `target`: `main`, `buggy`
- Two independent jobs:
  - UI tests (`ui-chromium` project)
  - API tests (`api` project)
- Artifacts uploaded per job/target:
  - HTML report
  - Raw test-results

### Trigger
- Push to `main` or `master`
- Pull requests to `main` or `master`
- Manual trigger (`workflow_dispatch`)

## Why this framework is scalable
- Centralized test data and account management in one source of truth.
- Fixtures hide setup complexity and keep tests focused on behavior.
- API client wrapper avoids duplicate request code.
- Env-driven config makes target switching deterministic for all environments.
- Test separation by concern (`ui` and `api`) supports selective execution and faster feedback loops.
- CI matrix enables the same test logic to validate multiple deployments.



## Known limitations and next improvements
- Some checkout/order scenarios are environment-sensitive and may require additional seeded test data.
- Add dedicated API auth fixture with token caching.
- Add contract schema validation (e.g., Zod or AJV) for richer API guardrails.
- Expand visual baselines to product detail and account pages with masking for volatile regions.
