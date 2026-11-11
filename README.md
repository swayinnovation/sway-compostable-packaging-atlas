# Compostable Packaging Atlas

Sway's internal reference on compostable-packaging labeling law, EPR treatment, certification, composter access, dates and litigation.

- Live site: Netlify, deployed from `site/` on every merge to `main`.
- Updates: a weekly Claude Code routine opens a pull request; a person reviews and merges.
- Safety net: `scripts/check.mjs` runs before every deploy. If it fails, the last good version stays live.

## How a week works
1. Monday morning the routine checks sources and opens a PR (or reports no changes) in Slack.
2. Open the PR. Netlify posts a deploy-preview link on it, so you can see the change live before merging.
3. Read the "Changes" table and "Needs a decision". Merge, or comment and close.
4. Merging deploys automatically.

## Editing by hand
Edit `site/index.html`, update `UPDATED_ISO` and `UPDATED`, run `node scripts/check.mjs`, open a PR.

Not legal advice. Verify consequential calls with the agency, certifier or counsel.
