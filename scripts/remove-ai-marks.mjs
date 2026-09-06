#!/usr/bin/env node
/**
 * Strip AI provenance marks from blog content.
 *
 * Thin client for the watermarks-remover HTTP service: it sends each file to
 * /inspect and /clean and writes back whatever the service returns. All the
 * cleaning logic lives server-side, so this script stays dependency-free.
 *
 *   node scripts/remove-ai-marks.mjs --all             # report on every post
 *   node scripts/remove-ai-marks.mjs --all --write     # clean every post in place
 *   node scripts/remove-ai-marks.mjs src/content/posts/foo.md --write
 *
 * Scope: deterministic cleaning only — invisible Unicode (Layer A) plus
 * frontmatter/metadata. The Layer B statistical rewrite needs judgment about
 * the prose, so run the /remove-ai-marks skill for that.
 *
 * Env:
 *   WATERMARKS_SERVICE_URL      base URL (default http://127.0.0.1:8765)
 *   WATERMARKS_SERVICE_API_KEY  bearer token, if the service requires one
 */

import { readFile, writeFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SERVICE = (process.env.WATERMARKS_SERVICE_URL ?? 'http://127.0.0.1:8765').replace(/\/$/, '');
const API_KEY = process.env.WATERMARKS_SERVICE_API_KEY ?? '';
const POSTS_DIR = 'src/content/posts';

const args = process.argv.slice(2);
const write = args.includes('--write');
const all = args.includes('--all');
const asJson = args.includes('--json');
const targets = args.filter((a) => !a.startsWith('--'));

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (API_KEY) h.Authorization = `Bearer ${API_KEY}`;
  return h;
}

async function post(endpoint, body) {
  const res = await fetch(`${SERVICE}${endpoint}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${endpoint} ${res.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function serviceUp() {
  try {
    const res = await fetch(`${SERVICE}/health`, { headers: headers() });
    return res.ok;
  } catch {
    return false;
  }
}

async function collectFiles() {
  if (targets.length > 0) return targets;
  if (!all) return [];
  const entries = await readdir(POSTS_DIR);
  return entries.filter((f) => f.endsWith('.md') || f.endsWith('.mdx')).map((f) => path.join(POSTS_DIR, f)).sort();
}

/** Codepoints the service flags, summarized for a one-line console report. */
function summarize(report) {
  const hits = report?.layer_a_hits ?? [];
  const parts = [];
  if (report?.has_c2pa) parts.push('C2PA');
  if (report?.has_ai_metadata) parts.push('AI metadata');
  for (const hit of hits) {
    const label = hit.name ?? hit.codepoint ?? JSON.stringify(hit);
    const count = hit.count ?? 1;
    parts.push(`${label}×${count}`);
  }
  for (const finding of report?.findings ?? []) {
    // layer-a findings restate the codepoints already listed above.
    if (typeof finding === 'string' && finding.startsWith('layer-a:')) continue;
    parts.push(typeof finding === 'string' ? finding : JSON.stringify(finding));
  }
  return parts;
}

async function main() {
  const files = await collectFiles();
  if (files.length === 0) {
    console.error('usage: node scripts/remove-ai-marks.mjs [--all | <file>...] [--write] [--json]');
    process.exit(2);
  }

  if (!(await serviceUp())) {
    console.error(
      `remove-ai-marks: service unreachable at ${SERVICE}\n` +
        '  start it with:  python3 service/scripts/server.py --host 127.0.0.1 --port 8765\n' +
        '  or:             docker compose up -d   (in the watermarks-remover checkout)\n' +
        '  or point WATERMARKS_SERVICE_URL at a running instance.'
    );
    process.exit(1);
  }

  const results = [];
  let dirty = 0;

  for (const file of files) {
    const bytes = await readFile(file);
    const payload = { file: bytes.toString('base64'), name: path.basename(file) };

    const inspected = await post('/inspect', payload);
    const marks = summarize(inspected.report);
    const suspicious = inspected.suspicious?.verdict === true || marks.length > 0;

    let changed = false;
    if (write) {
      const cleaned = await post('/clean', payload);
      const out = Buffer.from(cleaned.cleaned, 'base64');
      if (!out.equals(bytes)) {
        await writeFile(file, out);
        changed = true;
      }
    }

    if (suspicious) dirty += 1;
    results.push({ file, suspicious, marks, changed });

    if (!asJson) {
      const status = changed ? 'cleaned' : suspicious ? 'MARKS' : 'clean';
      const detail = marks.length > 0 ? `  (${marks.join(', ')})` : '';
      console.log(`${status.padEnd(8)} ${file}${detail}`);
    }
  }

  if (asJson) {
    console.log(JSON.stringify({ service: SERVICE, wrote: write, results }, null, 2));
  } else {
    const changedCount = results.filter((r) => r.changed).length;
    console.log(
      `\n${files.length} file(s) checked — ${dirty} with marks` +
        (write ? `, ${changedCount} rewritten` : dirty > 0 ? ' (re-run with --write to clean)' : '')
    );
  }

  // Dry runs gate CI: marks left in content is a failure. A --write run has
  // already fixed what it could, so it only fails on hard errors above.
  if (!write && dirty > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`remove-ai-marks: ${err.message}`);
  process.exit(1);
});
