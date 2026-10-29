# S01E03: what it shows

This repository preserves the supplied support knowledge-base export and adds a signed review of ticket #4471.

The two problem tickets use the desk's exported counts of 379 parser reports and 33
booking-hint reports. The parser count includes five unusual reports that need more evidence.
The desk counts them where they are filed and footnotes them. They do not establish another
problem. The two ticket counts cover all 412 unique reports.

The [course update](https://hq.mega.dev/challenges/what-it-shows) records both desk
resolutions on 5 October 2026. The parser ticket closed as fixed after
`fix(dates): parse dd/mm for eu locales`. The hint ticket closed as won't fix because the
`booking-v3` form was retired. These resolutions are newer than the 4 October export. This
repository did not deploy the parser change or retire the form.

- Read the [review source](src/routes/kb/incidents/4471-review/+page.svx).
- Open the [rendered review](rendered/review.html) in a browser. This file is a static snapshot without client-side interaction.
- Read the [parser ticket draft](issue-drafts/parser.md).
- Read the [hint ticket draft](issue-drafts/hint.md).
- Inspect the [verification results](verification.json).

`issue-drafts/temporal.md` and `issue-drafts/ordering.md` preserve an earlier exploration.
They are superseded and are not active problem-ticket drafts.

The source page uses the existing knowledge-base components. It recalculates its tables when rendered against the export. The original incident page and accepted decision are preserved as evidence.

## Reproduce the render

The export contains no build manifest. The renderer reuses an existing toolchain without installing packages or starting a web server.

Run this command from the repository root. Replace the second path with a project containing the required installed packages.

```sh
node scripts/render.mjs . /path/to/toolchain-project
```

The verified toolchain uses Svelte 5.57.2, mdsvex 0.12.8, Vite 8.3.4, and `@sveltejs/vite-plugin-svelte`. The command writes `rendered/*.html` and `verification.json`. It checks the report partition, deduplication examples, signature, and stale warnings.

These deliverables document the exported evidence and the later desk resolutions. They
contain no production fix and do not prove current service behavior.

## Original export documentation

# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.
