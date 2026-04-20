# Official Bug Evidence Pack

## Execution summary
- Full run on main target completed: 30 tests, 20 passed, 10 failed.
- Full run on buggy target completed: 30 tests, 14 passed, 16 failed.
- Focused trace run for catalog flow completed on both targets with explicit trace archives.

## Primary reports
- Main HTML report: [artifacts/main/playwright-report/index.html](artifacts/main/playwright-report/index.html)
- Buggy HTML report: [artifacts/buggy/playwright-report/index.html](artifacts/buggy/playwright-report/index.html)
- Main JUnit: [artifacts/main/test-results/junit/results.xml](artifacts/main/test-results/junit/results.xml)
- Main JSON report: [artifacts/main/test-results/json/results.json](artifacts/main/test-results/json/results.json)

## Screenshot evidence (main full run)
- US1 pagination mismatch: [artifacts/main/test-results/ui-catalog.ui-US1---View-P-976ab-s-products-and-can-paginate-ui-chromium/test-failed-1.png](artifacts/main/test-results/ui-catalog.ui-US1---View-P-976ab-s-products-and-can-paginate-ui-chromium/test-failed-1.png)
- US7 quantity update timeout: [artifacts/main/test-results/ui-account-cart-checkout.u-b8149-can-update-quantity-in-cart-ui-chromium/test-failed-1.png](artifacts/main/test-results/ui-account-cart-checkout.u-b8149-can-update-quantity-in-cart-ui-chromium/test-failed-1.png)
- US8 checkout page assertion failure: [artifacts/main/test-results/ui-account-cart-checkout.u-65214-s-shipping-payment-sections-ui-chromium/test-failed-1.png](artifacts/main/test-results/ui-account-cart-checkout.u-65214-s-shipping-payment-sections-ui-chromium/test-failed-1.png)
- US10 filter persistence failure: [artifacts/main/test-results/ui-catalog.ui-US10---Categ-e91d0--filter-persists-on-refresh-ui-chromium/test-failed-1.png](artifacts/main/test-results/ui-catalog.ui-US10---Categ-e91d0--filter-persists-on-refresh-ui-chromium/test-failed-1.png)

## Trace evidence
- Main trace sample (US1): [artifacts/trace-main/test-results/ui-catalog.ui-US1---View-P-976ab-s-products-and-can-paginate-ui-chromium/trace.zip](artifacts/trace-main/test-results/ui-catalog.ui-US1---View-P-976ab-s-products-and-can-paginate-ui-chromium/trace.zip)
- Buggy trace sample (US1): [artifacts/trace-buggy/test-results/test-results/ui-catalog.ui-US1---View-P-976ab-s-products-and-can-paginate-ui-chromium/trace.zip](artifacts/trace-buggy/test-results/test-results/ui-catalog.ui-US1---View-P-976ab-s-products-and-can-paginate-ui-chromium/trace.zip)
- Buggy trace sample (US10): [artifacts/trace-buggy/test-results/test-results/ui-catalog.ui-US10---Categ-28bcd-exceed-API-filtered-dataset-ui-chromium/trace.zip](artifacts/trace-buggy/test-results/test-results/ui-catalog.ui-US10---Categ-28bcd-exceed-API-filtered-dataset-ui-chromium/trace.zip)

## Response payload evidence
Main payload captures:
- [artifacts/payloads/main/_status_GET.json](artifacts/payloads/main/_status_GET.json)
- [artifacts/payloads/main/_products_GET.json](artifacts/payloads/main/_products_GET.json)
- [artifacts/payloads/main/_products_search_q_Hammer_GET.json](artifacts/payloads/main/_products_search_q_Hammer_GET.json)
- [artifacts/payloads/main/_products_by_category_slug_pliers_GET.json](artifacts/payloads/main/_products_by_category_slug_pliers_GET.json)
- [artifacts/payloads/main/_users_login_POST.json](artifacts/payloads/main/_users_login_POST.json)

Buggy payload captures:
- [artifacts/payloads/buggy/_status_GET.json](artifacts/payloads/buggy/_status_GET.json)
- [artifacts/payloads/buggy/_products_GET.json](artifacts/payloads/buggy/_products_GET.json)
- [artifacts/payloads/buggy/_products_search_q_Hammer_GET.json](artifacts/payloads/buggy/_products_search_q_Hammer_GET.json)
- [artifacts/payloads/buggy/_products_by_category_slug_pliers_GET.json](artifacts/payloads/buggy/_products_by_category_slug_pliers_GET.json)
- [artifacts/payloads/buggy/_users_login_POST.json](artifacts/payloads/buggy/_users_login_POST.json)
- API host fallback note: [artifacts/payloads/buggy/fallback_note.txt](artifacts/payloads/buggy/fallback_note.txt)

## High-value failing cases captured
- US1: Product card count expected 9, observed 27.
- US3: Search input interactions timing out; failure evidence includes screenshots and traces.
- US4: Category filter controls timing out under execution.
- US8: Checkout path and validation assertions failing in multiple runs.
- API contract/assertion: search response included unrelated name values (for example leather toolbelt while expecting hammer match logic).

## Reproduction command snapshots used
- Full main: TEST_TARGET=main then npx playwright test
- Full buggy: TEST_TARGET=buggy then npx playwright test
- Focused trace collection: npx playwright test tests/ui/catalog.ui.spec.ts --project=ui-chromium --trace on --workers=1
