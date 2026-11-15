#!/usr/bin/env node
// Post-build step for the /journal/ build: moves every blog address under /journal/.
//   node scripts/journal-base/rewrite-dist.mjs <dist-dir>
// - https://blog.koursea.com  ->  https://www.koursea.com/journal
// - root-relative href/src/action/poster/data-* values and srcset entries get the /journal prefix
// Astro's own base option already prefixes /_astro assets; those values are left alone.
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(process.argv[2] || "dist-journal");
const BASE = "/journal";
const TEXT_EXT = new Set([".html", ".xml", ".json", ".txt", ".js", ".css"]);

const prefix = (u) => (u.startsWith("/") && !u.startsWith("//") && u !== BASE && !u.startsWith(BASE + "/") ? BASE + u : u);

function rewrite(text, ext) {
  let out = text.replace(/https:\/\/blog\.koursea\.com/g, `https://www.koursea.com${BASE}`);
  if (ext === ".html") {
    out = out.replace(/\b(href|src|action|poster|data-src|data-href)=("|')(\/[^"']*)\2/g, (m, attr, q, val) => `${attr}=${q}${prefix(val)}${q}`);
    out = out.replace(/\bsrcset=("|')([^"']*)\1/g, (m, q, val) => `srcset=${q}${val.split(",").map((part) => {
      const t = part.trim(); const [u, ...rest] = t.split(/\s+/);
      return [prefix(u), ...rest].join(" ");
    }).join(", ")}${q}`);
  }
  if (ext === ".json") out = out.replace(/("(?:url|href|image|path)"\s*:\s*")(\/[^"]*)"/g, (m, k, v) => `${k}${prefix(v)}"`);
  return out;
}

let files = 0, changed = 0;
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    const ext = path.extname(entry.name).toLowerCase();
    if (!TEXT_EXT.has(ext)) continue;
    files += 1;
    const before = fs.readFileSync(full, "utf8");
    const after = rewrite(before, ext);
    if (after !== before) { fs.writeFileSync(full, after); changed += 1; }
  }
})(dist);
console.log(`journal base rewrite: ${changed} of ${files} text files changed in ${dist}`);
