# Day-first dates are parsed as month-first

## Problem

The shared date parser reads day-first dates as month-first. Calendar invites can therefore
swap the day and month for tenants that use a day-first locale.

## Reports covered

This problem ticket covers 374 unique reports in the 4 October export. The archived desk view
classifies 379 reports as parser. That row includes five reports now assigned only to
investigation tickets #3 and #4. The remaining 374 are classified as parser, but that
classification is not body-by-body proof of one root cause. The 33 hint reports are separate.

Examples include:

- `R-41200`, where 7 April became 4 July for `harbour.dental`.
- `R-41201`, where 4 July became 7 April for `harbour.dental`.
- `R-41203`, where 2 December became 12 February for `lantern.row`.

The evidence comes from `src/lib/data/reports-4471.json`, the tenant records under
`src/lib/data/tenants`, and `src/lib/kb/causes.ts`.

## Mechanism

`causeOf` classifies a report as `parser` when the tenant uses a day-first locale and the
booking-v3 hint mismatch does not apply. The example reports show the day-and-month swap. The
five reports assigned to tickets #3 and #4 remain unconfirmed and are outside this ticket's
problem coverage.

## Verification

- Parse a valid day-first date for every tenant locale in this ticket.
- Confirm that the parsed calendar date preserves the entered day and month.
- Confirm that month-first tenants still parse their dates correctly.
- Re-run the report partition and confirm that these reports no longer reproduce the swap.

## Uncertainty

This count describes the exported snapshot. It does not prove the current production state or
show whether a fix has been deployed.
