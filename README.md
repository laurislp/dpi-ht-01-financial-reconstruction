# DPI financial case review

Financial reconstruction of Divorce Party International Ltd. at 31 August 2026. The published build is intentionally read-only and includes the completed review, evidence links, schedules, 100 decisions and a matching `submission.json`.

## Published submission

The deployment is built from the approved data state and is suitable for assessment at these routes:

- `/review` — financial review and decision register
- `/statements` — reconstructed income statement and financial position
- `/schedules` — supporting reconciliations
- `/evidence` — original evidence register
- `/submission.json` — machine-readable submission matching the web application

The production build has no write API. The original editable local application remains available for further review before a new build is made.

## Accounting position

The base reconstruction reports revenue of EUR 960,000, profit of EUR 65,000, cash of EUR 60,000, total assets of EUR 531,000, liabilities of EUR 406,000 and conditional closing equity of EUR 125,000.

The inventory movement schedule implies EUR 112,000, whereas the usable physical count is EUR 121,000. This EUR 9,000 difference is expressly retained as an unresolved reconciliation item; the count-led profit alternative is EUR 74,000. Insurance evidence is absent. Opening receivables, payables and equity are conditional reconstructions. No unsupported balancing item or monthly breakdown has been invented.

## Local development

Run `npm test` to verify accounting and data integrity, then `npm run build` to create the deployable `dist` directory. For the editable local view, run `node server.mjs` and open `http://127.0.0.1:4188`.

The build requires a student name and ID and confirms every decision is certified before generating the public assets. Source evidence and the approved state are retained in `data/`.
