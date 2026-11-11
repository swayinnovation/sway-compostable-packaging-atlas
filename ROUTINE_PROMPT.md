# Weekly routine prompt (paste into Claude Code Routines)

Name: Atlas weekly update
Repository: sway-atlas
Schedule: Weekly, Monday 7:00 a.m. (Pacific)
Connectors: Slack only (post to the Atlas channel)

Prompt:

> Follow CLAUDE.md in this repository. Check every source listed under "Sources to check", compare against site/index.html, and make only the changes the sources support, with evidence labels and sources. Run node scripts/check.mjs and fix any failure before continuing. If there are changes, open a pull request using the template in CLAUDE.md. Then post a short message in the Slack channel #[CHANNEL]: the PR link, a one-line summary, and any "Needs a decision" items. If nothing changed, post "Atlas checked: no changes this week" and the sources checked. Don't merge anything.

Extra one-off runs (fire manually on these dates): Dec 15, Dec 27 and Dec 31, 2026; Jan 15, 2027; and whenever CalRecycle announces a decision on the June 30, 2027 extension.
