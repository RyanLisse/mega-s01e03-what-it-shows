# Investigate an invite that arrived before its booking existed

## Problem

`R-41236` says an invite arrived before the reporter made the booking. The day-and-month
classification does not explain this ordering symptom.

## Reports covered

This investigation covers one unique report named in `src/lib/data/desk-notes.json`.
The related record is in `src/lib/data/reports-4471.json`.

## Current evidence

`CauseTable` assigns the report to `parser` because `causeOf` uses the tenant, locale, form,
and channel. It does not inspect when the booking and invite were created or delivered.

The export does not establish whether the system generated the invite early, delivered it out
of order, or linked it to the wrong booking.

## Investigation and verification

- Recover the booking creation, invite generation, queue, and delivery timestamps.
- Match the invite to its booking and recipient identifiers.
- Check for retries, reused identifiers, clock differences, and delayed delivery.
- Reproduce the ordering symptom only after the event sequence is known.

## Uncertainty

The export contains no runtime trace or delivery record for this report. Do not assign a root
cause until those records explain the event order.
