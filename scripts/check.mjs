// Pre-deploy checks for the Compostable Packaging Atlas.
// Netlify runs this before every deploy; a failure blocks the deploy and keeps the last good version live.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
const errors = [];
const fail = (m) => errors.push(m);

// 1. Every inline script must compile.
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (!scripts.length) fail("No inline script found.");
scripts.forEach((code, i) => {
  try { new vm.Script(code, { filename: `inline-script-${i}.js` }); }
  catch (e) { fail(`Script ${i} does not compile: ${e.message}`); }
});
const js = scripts.join("\n");

// 2. Last-updated fields exist, agree, and are real dates.
const iso = js.match(/var UPDATED_ISO = "(\d{4}-\d{2}-\d{2})";/);
const human = js.match(/var UPDATED = "([A-Z][a-z]+ \d{1,2}, \d{4})";/);
if (!iso || !human) fail("UPDATED_ISO or UPDATED is missing or malformed.");
else {
  const a = new Date(iso[1] + "T00:00:00Z");
  const b = new Date(human[1] + " 00:00:00 UTC");
  if (isNaN(a) || isNaN(b) || a.getTime() !== b.getTime()) fail(`UPDATED_ISO (${iso[1]}) and UPDATED (${human[1]}) disagree.`);
  if (a.getTime() > Date.now() + 2 * 86400000) fail(`UPDATED_ISO (${iso[1]}) is in the future.`);
}

// 3. Every dated entry uses a valid ISO date.
for (const m of js.matchAll(/\{d:"([^"]*)"/g)) {
  const d = m[1];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(new Date(d + "T00:00:00Z"))) fail(`Invalid date in DATES: "${d}"`);
}

// 4. Evidence labels are from the allowed set.
const allowed = new Set(["C", "S", "P", "R", "G"]);
for (const m of js.matchAll(/\bev:"([^"]*)"/g)) if (!allowed.has(m[1])) fail(`Unknown evidence label ev:"${m[1]}"`);
for (const m of js.matchAll(/\bev\("([^"]*)"\)/g)) if (!allowed.has(m[1])) fail(`Unknown evidence label ev("${m[1]}")`);

// 5. Source links are https or null.
for (const m of js.matchAll(/\bu:("([^"]*)"|null)/g)) if (m[2] !== undefined && !/^https:\/\//.test(m[2])) fail(`Source URL is not https: ${m[2]}`);

// 6. Search-engine safeguards are still in place.
if (!/<meta name="robots" content="noindex, nofollow">/.test(html)) fail("noindex meta tag is missing.");

if (errors.length) { console.error("Atlas checks FAILED:\n- " + errors.join("\n- ")); process.exit(1); }
console.log(`Atlas checks passed (${scripts.length} script(s), updated ${human && human[1]}).`);
