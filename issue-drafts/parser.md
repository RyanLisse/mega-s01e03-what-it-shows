# Day-first dates are parsed as month-first

## Problem

The shared date parser reads day-first dates as month-first. Calendar invites can therefore
swap the day and month for tenants that use a day-first locale.

## Reports covered

This ticket covers 379 unique reports in the desk's exported parser view from 4 October.
The count includes five temporal reports that the desk files under parser and footnotes as
one-day moves. Those five are also tracked in investigation ticket #3, so the ticket counts
overlap. The other 374 reports support the day-and-month reversal. The 33 hint reports are separate.

Examples include:

- `R-41200`, where 7 April became 4 July for `harbour.dental`.
- `R-41201`, where 4 July became 7 April for `harbour.dental`.
- `R-41203`, where 2 December became 12 February for `lantern.row`.

The evidence comes from `src/lib/data/reports-4471.json`, the tenant records under
`src/lib/data/tenants`, and `src/lib/kb/causes.ts`.

## Mechanism

`causeOf` classifies a report as `parser` when the tenant uses a day-first locale and the
booking-v3 hint mismatch does not apply. Most report bodies support the day-and-month swap.
The five temporal reports remain unconfirmed and must not be treated as proof of this parser mechanism.

## Verification

- Parse a valid day-first date for every tenant locale in this ticket.
- Confirm that the parsed calendar date preserves the entered day and month.
- Confirm that month-first tenants still parse their dates correctly.
- Re-run the report partition and confirm that these reports no longer reproduce the swap.

## Uncertainty

This count describes the exported snapshot. It does not prove the current production state or
show whether a fix has been deployed.
