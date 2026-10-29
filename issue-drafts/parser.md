# Day-first dates are parsed as month-first

## Problem

The shared date parser reads day-first dates as month-first. Calendar invites can therefore
swap the day and month for tenants that use a day-first locale.

## Reports covered

This problem ticket covers 379 unique reports in the 4 October export. The count includes five
unusual reports that need more evidence. The desk counts them where they are filed and
footnotes them. They do not establish another problem.

Examples include:

- `R-41200`, where 7 April became 4 July for `harbour.dental`.
- `R-41201`, where 4 July became 7 April for `harbour.dental`.
- `R-41203`, where 2 December became 12 February for `lantern.row`.

The evidence comes from `src/lib/data/reports-4471.json`, the tenant records under
`src/lib/data/tenants`, and `src/lib/kb/causes.ts`.

## Mechanism

The example reports show the shared date reader swapping day and month for day-first input.
The exported classification uses the tenant's locale, form, and channel. It does not inspect
the report body.

## Five reports needing further investigation

- `R-41202` says the invite and calendar differed by one day.
- `R-41209` says June bookings were one day off.
- `R-41236` says the invite arrived before the booking existed.
- `R-41344` says recipients in Lisbon and Toronto received different weekdays.
- `R-41620` says Tuesday 6 October appeared as Monday.

These reports remain in this ticket because the export classifies them as parser. Their bodies
do not confirm another cause. Runtime timestamps and delivery records are needed before the
desk can identify another problem.

## Verification

- Parse a valid day-first date for every tenant locale in this ticket.
- Confirm that the parsed calendar date preserves the entered day and month.
- Confirm that month-first tenants still parse their dates correctly.
- Re-run the supported day-and-month reversal cases and confirm that they no longer reproduce the swap.
- Keep the five footnoted reports visible until evidence identifies their causes.

## Uncertainty

This count describes the exported snapshot. It does not prove the current production state or
show whether a fix has been deployed.
