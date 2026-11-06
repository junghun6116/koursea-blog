#!/usr/bin/env node
"use strict";
// Offline check of this repository's Claude Code project skills (.claude/skills/*).
// Verifies frontmatter and description limits, relative links, that every repo command, npm/pnpm script
// and repo path mentioned in a project skill or guidance doc exists in THIS repository, that CLAUDE.md
// lists every project skill, and that nothing looks like a secret. No network, no side effects.
// Skills in EXTERNAL_SKILLS come from another source: only their frontmatter is checked.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const skillsDir = path.join(root, ".claude/skills");
const EXTERNAL_SKILLS = new Set(["remove-ai-marks"]);
const GUIDANCE_DOCS = ["CLAUDE.md", "docs/decision-log.md"];
const PATH_ROOTS = ["docs", "data", "reports", "scripts", "api", "admin", "assets", "lib", "src", "public", "dist", ".github", ".claude"];
const PNPM_BUILTINS = new Set(["install", "i", "add", "remove", "rm", "update", "up", "run", "exec", "dlx", "store", "list", "ls", "why", "outdated", "audit", "config", "env", "prune", "rebuild", "approve-builds"]);

const problems = [];
const fail = (message) => problems.push(message);
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const pkgFile = path.join(root, "package.json");
const scripts = fs.existsSync(pkgFile) ? JSON.parse(fs.readFileSync(pkgFile, "utf8")).scripts || {} : {};

if (!fs.existsSync(skillsDir)) { console.error("No .claude/skills directory."); process.exit(1); }
const names = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const projectSkills = names.filter((n) => !EXTERNAL_SKILLS.has(n));
if (!projectSkills.length) fail("no project skills found");

for (const name of names) {
  const file = path.join(skillsDir, name, "SKILL.md");
  if (!fs.existsSync(file)) { fail(`${name}: SKILL.md is missing`); continue; }
  const text = fs.readFileSync(file, "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) { fail(`${name}: frontmatter must start on line 1`); continue; }
  const block = fm[1];
  const value = (key) => {
    const m = block.match(new RegExp(`^${key}:\\s*(>-?|\\|-?)?[ \\t]*(.*)$`, "m"));
    if (!m) return null;
    if (!m[1]) return m[2].trim();
    const rest = block.slice(m.index + m[0].length).split("\n").slice(1);
    const lines = []; for (const line of rest) { if (/^\s+\S/.test(line)) lines.push(line.trim()); else break; }
    return lines.join(" ");
  };
  if (value("name") !== name) fail(`${name}: name must equal the directory name`);
  const description = value("description");
  if (!description) fail(`${name}: description is required`);
  else if (description.length + (value("when_to_use") || "").length > 1536) fail(`${name}: description + when_to_use exceed 1,536 characters`);
  if (text.split("\n").length > 500) fail(`${name}: SKILL.md is over 500 lines`);
  if (!EXTERNAL_SKILLS.has(name) && description && !/\bUse when\b/i.test(description)) fail(`${name}: description must say when to use the skill`);
}

const docs = [
  ...GUIDANCE_DOCS.map((d) => path.join(root, d)),
  ...projectSkills.flatMap((n) => (fs.existsSync(path.join(skillsDir, n)) ? walk(path.join(skillsDir, n)) : []))
];
for (const file of docs) {
  const rel = path.relative(root, file);
  if (!fs.existsSync(file)) { fail(`${rel} is missing`); continue; }
  if (!/\.(md|mjs|cjs|js)$/.test(file) || /\.(mjs|cjs|js)$/.test(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  const owner = projectSkills.find((n) => file.includes(`${path.sep}${n}${path.sep}`));
  const commandPattern = /(?:^|`)(?:node|python3|tsx)(?: --[a-z-]+(?:=\S+)?)* (scripts\/[A-Za-z0-9_.\-]+)/gm;
  for (const m of text.matchAll(commandPattern)) if (!fs.existsSync(path.join(root, m[1]))) fail(`${rel}: command target ${m[1]} does not exist`);
  for (const m of text.matchAll(/\b(?:npm|pnpm) run ([a-z0-9:\-]+)/g)) if (!scripts[m[1]]) fail(`${rel}: script "${m[1]}" is not in package.json`);
  for (const m of text.matchAll(/\bpnpm ([a-z][a-z0-9:\-]*)/g)) if (!PNPM_BUILTINS.has(m[1]) && m[1] !== "run" && !scripts[m[1]]) fail(`${rel}: pnpm command "${m[1]}" is neither a built-in nor a package.json script`);
  const rootsPattern = new RegExp("`((?:" + PATH_ROOTS.map((r) => r.replace(".", "\\.")).join("|") + ")\\/[A-Za-z0-9_.\\-\\/\\[\\]]+\\.[a-z]+)`", "g");
  for (const m of text.matchAll(rootsPattern)) if (!/[*<>]/.test(m[1]) && !fs.existsSync(path.join(root, m[1]))) fail(`${rel}: referenced path ${m[1]} does not exist`);
  for (const m of text.matchAll(/\]\((?!https?:|#)([^)#]+)\)/g)) if (!fs.existsSync(path.join(path.dirname(file), m[1]))) fail(`${rel}: link target ${m[1]} does not exist`);
  for (const m of text.matchAll(/`references\/([A-Za-z0-9_.\-]+)`/g)) if (owner && !fs.existsSync(path.join(skillsDir, owner, "references", m[1]))) fail(`${rel}: references/${m[1]} does not exist`);
  if (/(eyJ[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,})/.test(text)) fail(`${rel}: looks like it contains a secret`);
}

const claude = fs.existsSync(path.join(root, "CLAUDE.md")) ? fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8") : "";
for (const name of projectSkills) if (!claude.includes(name)) fail(`CLAUDE.md does not mention project skill ${name}`);

if (problems.length) { console.error(`Claude skill check failed:\n- ${problems.join("\n- ")}`); process.exit(1); }
console.log(`Claude skill check passed: ${projectSkills.length} project skill(s) (${names.length} total), ${docs.length} files.`);
