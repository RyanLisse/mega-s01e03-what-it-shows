# Investigate five temporal date anomalies

## Problem

Five reports describe timing behavior that the day-and-month classification does not explain.
The export routes them to `parser`, but their bodies do not establish that cause.

## Reports covered

This investigation covers five unique reports named in
`src/lib/data/desk-notes.json`:

- `R-41202` says an invite date differed by one day from the calendar date.
- `R-41209` says June bookings were one day off.
- `R-41236` says an invite arrived before the booking existed.
- `R-41344` says recipients in Lisbon and Toronto received different weekdays for one meeting.
- `R-41620` says Tuesday 6 October appeared as Monday.

The related records are in `src/lib/data/reports-4471.json`.

## Current evidence

`CauseTable` assigns all five reports to `parser` because `causeOf` uses the tenant, locale,
form, and channel. It does not inspect the reported timing behavior. Four bodies are compatible
with a time-zone or date-boundary defect. `R-41236` describes a different ordering defect.

## Investigation and verification

- Recover event creation, parsing, time-zone, invite generation, and delivery timestamps for each report.
- Compare the tenant, organizer, attendee, and service time zones at every conversion boundary.
- Reproduce each symptom with the same locale, form, channel, date, and time-zone combination.
- Split this ticket if the traces show more than one failure mechanism.

## Uncertainty

The export does not contain runtime traces or source timestamps for invite generation and
delivery. Do not label these reports as one time-zone bug until those records support that
claim.
