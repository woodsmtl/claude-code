# Nightly update

The scheduled task follows this file every night at midnight America/New_York. Change the procedure here, in a reviewed
commit, rather than in the task's prompt.

Live page: https://claude.ai/artifact/VVTYZtxahuqfa368qYoLV9. The repo's `site/` is the source of truth, and the
artifact is published from it.

## 0. Start

1. Run `npm test`. If it fails before you change anything, stop and report the failure.
2. Read the live artifact and save it. If it is not identical to `node scripts/build.mjs` output, someone published
   outside the repo: run `node scripts/split.mjs <saved file>`, commit that alone as
   `Sync from artifact <version>`, and build on it.
3. Work on a branch named `nightly/YYYY-MM-DD`, using tonight's date in America/New_York.

## 1. Never delete past listings

Never delete a listing whose dates have passed. Past listings stay in the data so they appear under the Past filter.
The app tags them Past automatically. Leave them exactly as they are, and don't re-check them.

## 2. Scope and new listings

- CultureQ lists events, programs and scholarships in four categories: Funding (`program`), Arts & Culture
  (`cultural`), Career (`corporate`) and Social (`social`). This includes community-rooted celebrations and
  application-based programs.
- Don't add general family or children's events, such as museum kids' days, holiday crafts, family festivals or story
  times, unless the organizer's own page states a specific community or cultural focus. Examples that qualify: a
  Kwanzaa celebration, or a sensory-adapted session for families with disabilities. Age or school level alone is not a
  community. Where a listing has a community focus, set its `identities` to the matching `COMMUNITIES` values.
- Add an item only if every date, price, eligibility rule and link has been confirmed on the organizer's own page.
  Roundups, news articles and third-party listings can surface candidates but are never a listing's source. If the
  organizer's page can't be reached or doesn't state the date, leave the item out. There is no nightly limit.
- Before adding, check the same event isn't already listed (same organizer, same dates). Merge duplicates into one
  listing.
- Titles use title capitalization: capitalize major words. Keep a, an, the, and, but, or, for, of, in, on, at, to
  and by lowercase unless first. Keep acronyms and proper names as written, such as "van" in "Jan van Eyck".
- Every new listing needs:
  - a `CAL_WORDS` entry: the most telling word of the title, 8 letters or fewer.
  - `added: 'YYYY-MM-DD'`: tonight's date in America/New_York.
- Use kinds from the existing vocabulary where one fits.
- Open candidates: Brooklyn Children's Museum Kwanzaa (Dec 26–30, 2026) and the NYBLACKMBA Festival (Feb 24–26, 2027).
  Add each one only once its organizer page confirms it.

### New tag

The app shows New for 7 days after an item's `added` date. So:

- never add `added` to old items,
- never change an existing `added` date,
- never invent one.

Every night, confirm that only items added within the last 7 days would show New. Fix the data or the flag code if
anything else would.

## 3. Re-check every upcoming listing

1. Open the organizer's page for every listing that isn't past. Start with the ones closing or starting soonest, then
   the ones checked longest ago.
2. Confirm each date, price, eligibility rule and link still matches, and correct any difference.
3. For each listing confirmed tonight, set `source` to the same kind followed by tonight's date, for example
   `checked('Organizer page', TONIGHT)`, and set `TONIGHT` to tonight's date.
4. Don't touch the `source` of a listing you couldn't reach or confirm. Never write a checked date you didn't earn.
   Report each one as `UNCHECKED: id, title`.
5. Re-check the John Ruskin Prize amount (id 31) and the Sundance Graton Fellowship deadline (id 60).

## 4. Filter names

Review the filter names against the listings as they now stand:

- the `FACETS` labels and group headings,
- `KINDS`, `FIELDS`, `COMMUNITIES` and `LEVELS` (the Stage filter),
- the option text.

Make each name as accurate, clear and concise as the listings allow:

- add a value when new listings need one and none fits,
- rename one that no longer fits,
- merge or drop one that is redundant.

Keep names short, in plain language, with Oxford commas in lists. When you rename a value, update every listing,
test, alert and saved-filter migration that uses it. Report renames.

## 5. Unchanged rules

- Keep the schema, the earthy palette (clay, deep teal, plum, olive) and the shapes.
- Site copy never says Black or minority, uses no slurs and never says "see site".
- The name is CultureQ and the logo mark is CQ. Never write the old name.
- Every view lists opportunities as the same full white cards.
- Never set `ANALYTICS_URL` or `CONTRIBUTE_LINKS`, and never claim an integration is live.

## 6. Test, commit, publish

1. Run `npm test`. Fix every failure the night's changes caused. Never weaken, skip or delete a test to get green.
2. Commit on the nightly branch, push it, and open a pull request titled `Nightly update YYYY-MM-DD` with the report as
   its body. Don't merge it.
3. Only if the tests pass: run `node scripts/build.mjs` and publish `dist/cultureq.html` to the artifact URL above. If
   the publish is refused because a newer version exists, merge onto it, re-run the tests and publish again.
   If the tests fail, don't publish, and say so in the report.

## 7. Report

A short plain-text report, emailed to the owner, so it never includes secrets or personal data. It contains, in order:

1. First line: `NEW LISTINGS: N`, followed by one line per new listing (title, date, official link). Or
   `NEW LISTINGS: none`.
2. `CHECKED: N of M listings confirmed tonight`.
3. Any `UNCHECKED:` lines.
4. Filter-name changes.
5. New-tag fixes.
6. Date corrections.
7. The pull request link.
8. Whether the artifact was published.
