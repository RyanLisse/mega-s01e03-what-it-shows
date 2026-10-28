# Booking v3 shows a month-first hint to day-first tenants

## Problem

`booking-v3` shows `MM/DD/YYYY` to people booking with day-first tenants. The form then reads
the submitted date using the tenant's day-first locale, so the visible hint and the parser
disagree.

## Reports covered

This ticket covers 33 unique reports in the 4 October export. They came through the form
channel for `alder.physio`, `copper.studio`, or `pale.harbour`.

Examples include:

- `R-41230`, where a `copper.studio` form booking produced a swapped January and June date.
- `R-41372`, where an `alder.physio` form booking swapped August and September.
- `R-41406`, where a `pale.harbour` form booking swapped July and August.

The evidence comes from `src/lib/data/reports-4471.json`, the tenant records under
`src/lib/data/tenants`, and the `DATE_HINT` and `causeOf` rules in `src/lib/kb/causes.ts`.

## Mechanism

All three affected tenants use a day-first locale and `booking-v3`. `DATE_HINT` assigns
`MM/DD/YYYY` to that form version. `causeOf` classifies this combination as `hint`.

## Verification

- Render booking v3 for each affected tenant.
- Confirm that the hint matches the tenant's locale.
- Submit an ambiguous date and confirm that the stored calendar date matches the visible hint.
- Confirm that booking v2 and month-first tenants keep their current behavior.

## Uncertainty

This count describes the exported snapshot. It does not prove the current production state or
show whether a fix has been deployed.
