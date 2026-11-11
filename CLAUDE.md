# Compostable Packaging Atlas: maintenance instructions

This repo is Sway's compostable-packaging regulatory reference. The whole site is `site/index.html`.
Netlify deploys `site/` whenever `main` changes, after `node scripts/check.mjs` passes.

## Your job on a scheduled run

Check whether anything in the Atlas is out of date, fix what is, and open a pull request. Never push to `main`.

1. Check every source in "Sources to check" below. Read primary sources (statutes, agency pages, CAA schedules, dockets) before trade press.
2. Compare what you find against the data in `site/index.html`.
3. Make only the changes the sources support. If nothing changed, open no PR. Post "No changes this week" with the sources you checked.
4. Run `node scripts/check.mjs`. Don't open a PR if it fails.
5. Open a PR titled `Atlas update: <Month D, YYYY>` using the PR template below.

## Where the data lives (all in site/index.html)

| Array | What it holds |
|---|---|
| `UPDATED_ISO`, `UPDATED` | Last-updated date. Set both to today's date on every PR, in both formats. |
| `SRC` | Source list (title `t`, URL `u` or null). Add a source for any new claim. |
| `LAB` | Labeling rules by state (`std`, `cert`, `mark`, `home`, `biod`, `extra`, `detail`). |
| `EPR` | EPR treatment of compostables by state. |
| `CERT_COLS`, `CERT` | Certification matrix. |
| `COMP` | Composter acceptance. |
| `DATES` | Dates and signposts. `d` is ISO `YYYY-MM-DD`; `approx:true` if estimated; `it` is the if/then. |
| `LIT`, `POL` | Litigation and policy watch. |
| `PFAS` | PFAS food-packaging laws. |
| `FAQ`, `GAPS`, `REVIEW` | FAQ, known gaps, items under counsel review. |
| `evalCA` … `evalFTC` | Screener logic. See "Don't change without flagging". |

Edit entries in place. Keep one entry per line so diffs stay readable.

## Accuracy rules (non-negotiable)

- **Never invent** a statute, section, bill number, rate, date, case, docket number, standard, or agency position. If you can't point to a real source, don't add it; add it to `GAPS` instead.
- Every new or changed claim needs a source in `SRC` and an evidence label:
  - `C` Confirmed: quotable from a statute, adopted rule, agency letter, approved plan, published schedule, or court order.
  - `S` Signaled: official but not final (draft rule, filed plan, preliminary rate, announced consultation), or a reading where the text leaves room.
  - `P` Speculative: projection or placeholder.
  - `R` Under counsel review: Sway interpretation. **Never create a new `R` item or change an existing one**; flag it in the PR instead.
  - `G` Not verified.
- Don't upgrade a label (e.g., S to C) without a primary source. Downgrade to `S` anything you couldn't recheck.
- Keep pending bills, guidance, NOSB votes and preliminary rates clearly labeled as such. Never present them as law.
- Use typographic apostrophes and quotes (’ “ ”) in text people read; straight quotes only in code.
- Plain, specific prose. No hype, no sustainability clichés.

## Don't change without flagging (put these under "Needs a decision" in the PR)

- Screener logic (`eval*` functions) or any verdict a typical query would get.
- Anything that reads as a Sway position: policy stances, recommended next steps (`STAGES`), the PACK Act framing.
- Anything in `REVIEW` or labeled `R`.
- Removing a state, rule, or source.

## Never add

- Sway formulation details, supplier names, customer names, pricing or pipeline.
- Anything marked internal from Slack or email.

## Sources to check

California: CalRecycle AB 1201 / NOP extension status; CalRecycle covered material category list (annual, ~Dec 31); CalRecycle decision on CAA's program plan; CAA California fee schedule.
USDA / NOSB: AMS compost rulemaking or consultation; NOSB meeting outcomes (agar, carrageenan, compost items).
Washington: Ecology compostable labeling (RCW 70A.455) guidance; CAA Washington early fees.
Colorado: CDPHE Compostables Labeling Act page; CAA Colorado dues; CDPHE eco-modulation bonus guidance.
Minnesota: Minn. Stat. 325E.046 and any amending bill; MPCA.
Maryland: Env't § 9-2102; MDE packaging EPR.
Oregon: DEQ compostability report (due Dec 15, 2026); RMA rulemaking; CAA Oregon fees.
Federal: PACK Act (H.R. 6832) and Truth in Labeling Act (H.R. 10048 / S. 5302) status; FTC Green Guides.
Courts: Nebraska et al. & NAW v. Heller (E.D. Cal.); SB 343 challenge; NAW v. Feldon (9th Cir. No. 26-6404); ILMA v. CDPHE; NAW v. Ryan.
Composters: BioCycle, Resource Recycling, Packaging Dive, Waste Dive for facility acceptance news.
New state laws: any newly enacted compostable-labeling or PFAS food-packaging law.

## PR template

```
## Summary
One or two sentences: what changed and why it matters for Sway's customers.

## Changes
| Section | Before | After | Source | Label |
|---|---|---|---|---|

## Needs a decision
Items from "Don't change without flagging", or "None".

## Checked, no change
Sources checked with nothing new.

## New gaps
Anything found but not verifiable.
```
