# Bug Report Summary

This file captures defects observed while running UI tests against the buggy deployment: https://with-bugs.practicesoftwaretesting.com.

## Run context
- Target: buggy
- Project: ui-chromium
- Latest outcome: 7 passed, 16 failed

## Genuine Product Defects (to keep in bug report)

1. Header navigation regression (Contact link)
- Evidence tests:
	- tests/ui/bug-hunt-regressions.ui.spec.ts - home and contact links redirect correctly
- Observed behavior:
	- Contact link is missing or misspelled (for example Contakt), causing header navigation assertions to fail.
- Impact:
	- Core navigation is inconsistent and user flows to Contact are broken.

2. Login identity regression (account name mismatch)
- Evidence tests:
	- tests/ui/account-cart-checkout.ui.spec.ts - US5 positive login
	- tests/ui/bug-hunt-regressions.ui.spec.ts - login identity checks for Jane Doe, Jack Howe, Bob Smith
- Observed behavior:
	- Successful login does not reliably show the expected authenticated full name in header.
- Impact:
	- Users cannot reliably verify authenticated identity; account context appears unstable.

3. Cart and checkout flow instability on buggy deployment
- Evidence tests:
	- tests/ui/account-cart-checkout.ui.spec.ts - US6 add to cart
	- tests/ui/account-cart-checkout.ui.spec.ts - US8 checkout stepper with payment stage
- Observed behavior:
	- Add-to-cart/checkout progression is inconsistent; expected checkout controls or cart context are not reliably available.
- Impact:
	- Purchase journey is unreliable and can block checkout completion.

4. Order history access regression for logged-in users
- Evidence tests:
	- tests/ui/account-cart-checkout.ui.spec.ts - US9 positive order history/invoices
- Observed behavior:
	- Logged-in users cannot consistently access invoices/order-history flow.
- Impact:
	- Post-purchase account functionality is degraded.

5. Catalog behavior regressions (pagination/search/filter)
- Evidence tests:
	- tests/ui/catalog.ui.spec.ts - US1 positive pagination
	- tests/ui/catalog.ui.spec.ts - US3 negative non-matching search
	- tests/ui/catalog.ui.spec.ts - US4 positive and negative category filter
	- tests/ui/catalog.ui.spec.ts - US10 positive and negative filter consistency
- Observed behavior:
	- Product catalog interactions time out or do not expose expected controls/results under buggy target.
- Impact:
	- Users cannot reliably discover/filter products.

6. Visual regressions on buggy target
- Evidence tests:
	- tests/ui/visual-regression.ui.spec.ts - header visual baseline
- Observed behavior:
	- Header differs from baseline dimensions/layout.
- Impact:
	- UI consistency and trust are reduced.

Automation note:
- Catalog filters visual mismatch was caused by unstable snapshot capture scope (dynamic panel height), not a product defect.
- Visual capture logic was stabilized; this now passes on main and compare runs.

## Non-product Failures (framework/test issues)
- None identified in the latest buggy run.
- Validation note:
	- Main functional UI run remains green, indicating current failures are target-specific product regressions rather than framework breakage.

## Notes
- These failures are expected to remain red on buggy target and should be reported as defects, not suppressed.
- Keep visual failures tracked separately where needed, but include them as genuine regressions for buggy release reporting.
