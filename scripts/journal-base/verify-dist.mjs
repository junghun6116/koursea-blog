#!/usr/bin/env node
// Verifies a /journal/ build (after rewrite-dist.mjs): no blog.koursea.com left, every local link
// is under /journal/ and resolves to a built file, canonicals point at www.koursea.com/journal/.
//   node scripts/journal-base/verify-dist.mjs <dist-dir>
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(process.argv[2] || "dist-journal");
const BASE = "/journal";
const errors = [];
const seen = new Set();
const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full); else if (/\.(html|xml|json|txt)$/i.test(e.name)) htmlFiles.push(full);
  }
})(dist);

function resolves(urlPath) {
  const rel = decodeURIComponent(urlPath.slice(BASE.length)).replace(/^\//, "");
  const target = path.join(dist, rel);
  return fs.existsSync(target) && fs.statSync(target).isFile() ? true : fs.existsSync(path.join(target, "index.html"));
}

for (const file of htmlFiles) {
  const rel = path.relative(dist, file);
  const text = fs.readFileSync(file, "utf8");
  if (/blog\.koursea\.com/.test(text)) errors.push(`${rel}: still mentions blog.koursea.com`);
  if (!file.endsWith(".html")) continue;
  const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/.exec(text);
  if (canonical && !canonical[1].startsWith(`https://www.koursea.com${BASE}/`)) errors.push(`${rel}: canonical ${canonical[1]} is not under www.koursea.com${BASE}/`);
  for (const m of text.matchAll(/<meta[^>]+(?:property|name)="(?:og:url|og:image|twitter:image)"[^>]+content="(https:\/\/www\.koursea\.com[^"]*)"/g)) {
    if (!m[1].startsWith(`https://www.koursea.com${BASE}/`)) errors.push(`${rel}: social meta ${m[1]} is not under www.koursea.com${BASE}/`);
  }
  for (const m of text.matchAll(/\b(?:href|src)="(\/[^"#?]*)/g)) {
    const u = m[1];
    if (u.startsWith("//")) continue;
    const key = `${rel}|${u}`; if (seen.has(key)) continue; seen.add(key);
    if (!u.startsWith(BASE + "/") && u !== BASE) errors.push(`${rel}: local link ${u} is not under ${BASE}/`);
    else if (!resolves(u)) errors.push(`${rel}: link ${u} does not resolve to a built file`);
  }
}
const shown = errors.slice(0, 40);
if (errors.length) { console.error(shown.map((e) => `- ${e}`).join("\n") + (errors.length > shown.length ? `\n... and ${errors.length - shown.length} more` : "")); console.error(`${errors.length} problem(s)`); process.exit(1); }
console.log(`journal build verified: ${htmlFiles.length} files, ${seen.size} distinct local links, no blog.koursea.com left.`);
