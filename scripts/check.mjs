// Pre-deploy checks for the Compostable Packaging Atlas and the EPR Cost Calculator.
// Netlify runs this before every deploy; a failure blocks the deploy and keeps the last good version live.
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const errors = [];
const fail = (m) => errors.push(m);
const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const inlineScripts = (html) => [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
function compiles(html, label) {
  const s = inlineScripts(html);
  if (!s.length) fail(`${label}: no inline script found.`);
  s.forEach((code, i) => { try { new vm.Script(code, { filename: `${label}-script-${i}.js` }); } catch (e) { fail(`${label}: script ${i} does not compile: ${e.message}`); } });
  return s.join("\n");
}

// ---------- Atlas ----------
const atlas = read("../site/index.html");
const js = compiles(atlas, "Atlas");
const iso = js.match(/var UPDATED_ISO = "(\d{4}-\d{2}-\d{2})";/);
const human = js.match(/var UPDATED = "([A-Z][a-z]+ \d{1,2}, \d{4})";/);
if (!iso || !human) fail("Atlas: UPDATED_ISO or UPDATED is missing or malformed.");
else {
  const a = new Date(iso[1] + "T00:00:00Z"), b = new Date(human[1] + " 00:00:00 UTC");
  if (isNaN(a) || isNaN(b) || a.getTime() !== b.getTime()) fail(`Atlas: UPDATED_ISO (${iso[1]}) and UPDATED (${human[1]}) disagree.`);
  if (a.getTime() > Date.now() + 2 * 86400000) fail(`Atlas: UPDATED_ISO (${iso[1]}) is in the future.`);
}
for (const m of js.matchAll(/\{d:"([^"]*)"/g)) if (!/^\d{4}-\d{2}-\d{2}$/.test(m[1]) || isNaN(new Date(m[1] + "T00:00:00Z"))) fail(`Atlas: invalid date in DATES: "${m[1]}"`);
const allowed = new Set(["C", "S", "P", "R", "G"]);
for (const m of js.matchAll(/\bev:"([^"]*)"/g)) if (!allowed.has(m[1])) fail(`Atlas: unknown evidence label ev:"${m[1]}"`);
for (const m of js.matchAll(/\bev\("([^"]*)"\)/g)) if (!allowed.has(m[1])) fail(`Atlas: unknown evidence label ev("${m[1]}")`);
for (const m of js.matchAll(/\bu:("([^"]*)"|null)/g)) if (m[2] !== undefined && !/^https:\/\//.test(m[2])) fail(`Atlas: source URL is not https: ${m[2]}`);
if (!/<meta name="robots" content="noindex, nofollow">/.test(atlas)) fail("Atlas: noindex meta tag is missing.");

// ---------- Calculator ----------
const calcPath = "../site/calculator/index.html";
if (!existsSync(new URL(calcPath, import.meta.url))) fail("Calculator: site/calculator/index.html is missing.");
else {
  const calc = read(calcPath);
  const cjs = compiles(calc, "Calculator");
  if (!/<meta name="robots" content="noindex, nofollow">/.test(calc)) fail("Calculator: noindex meta tag is missing.");
  // Rates that appear in both tools must agree. Each entry: [label, regex on the calculator's R0, text the Atlas must contain].
  const r0 = cjs.slice(cjs.indexOf("const R0="), cjs.indexOf("const S0="));
  const pick = (re) => { const m = r0.match(re); return m ? parseFloat(m[1]) : NaN; };
  const usd = (v) => "$" + v.toFixed(2);
  const pairs = [
    ["California compostable film (P45P)", /P45P:([\d.]+)/, (v) => usd(v) + "/lb base"],
    ["Colorado certified compostable", /co:\{[^}]*cert:([\d.]+)/, (v) => usd(v) + "/lb final"],
    ["Colorado HDPE/LDPE film", /co:\{pe:([\d.]+)/, (v) => "HDPE/LDPE film " + usd(v) + "/lb"],
    ["Colorado PP film", /co:\{[^}]*pp:([\d.]+)/, (v) => "PP film " + usd(v)],
    ["Oregon PLA/PHA/PHB film", /or:\{[^}]*pla:([\d.]+)/, (v) => usd(v) + "/lb final"],
    ["Oregon HDPE/LDPE film", /or:\{pe:([\d.]+)/, (v) => "HDPE/LDPE flexible " + usd(v) + "/lb"],
    ["Washington compostable early fee", /wa:\{[^}]*comp:([\d.]+)/, (v) => (v * 100).toFixed(1) + "¢/lb (2027 early fees"],
  ];
  for (const [label, re, fmt] of pairs) {
    const v = pick(re);
    if (isNaN(v)) { fail(`Calculator: couldn't read rate "${label}".`); continue; }
    if (!atlas.includes(fmt(v))) fail(`Rates disagree: calculator has ${label} = ${fmt(v)}, which doesn't appear in the Atlas EPR table.`);
  }
}

if (errors.length) { console.error("Checks FAILED:\n- " + errors.join("\n- ")); process.exit(1); }
console.log("Atlas and calculator checks passed.");
