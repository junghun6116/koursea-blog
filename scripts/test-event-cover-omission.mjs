// Fixture test for the cover-omission path of scripts/check-editorial-cover-policy.mjs.
// It writes small posts to a temporary folder and runs the check on them, so it does not
// depend on any live post (the previous version pinned one post that later gained a cover).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const post = (fields) => `---\ntitle: Fixture post\ndescription: Fixture used by the cover-omission test.\npubDate: 2026-11-01\n${fields}\n---\n\nBody.\n`;
const reason = 'coverOmissionReason: No rights-cleared photograph of this venue is available yet.';

function run(posts) {
  const dir = mkdtempSync(path.join(tmpdir(), 'cover-policy-'));
  try {
    const postsDir = path.join(dir, 'posts');
    mkdirSync(postsDir);
    for (const [name, body] of Object.entries(posts)) writeFileSync(path.join(postsDir, `${name}.md`), body);
    const result = spawnSync(process.execPath, ['scripts/check-editorial-cover-policy.mjs', postsDir], { encoding: 'utf8' });
    return { status: result.status, out: `${result.stdout}${result.stderr}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

let r = run({ omitted: post(reason) });
assert.equal(r.status, 0, r.out);
assert.match(r.out, /1 explicitly documented omissions/);

r = run({ leftover: post(`${reason}\ncoverImage: /images/example.webp`) });
assert.equal(r.status, 1, 'an omission must not keep cover fields');
assert.match(r.out, /leftover\.md: omitted cover requires a meaningful reason and no retained image fields/);

r = run({ thumb: post(`${reason}\nthumbnail: /images/example.webp`) });
assert.equal(r.status, 1, 'an omission must not keep a thumbnail');

r = run({ short: post('coverOmissionReason: too short') });
assert.equal(r.status, 1, 'a reason under 20 characters is rejected');

r = run({ bare: post('tags: [kpop]') });
assert.equal(r.status, 1, 'a post with neither a cover nor an omission fails');
assert.match(r.out, /bare\.md: missing coverImage/);
assert.match(r.out, /document the omission: coverOmissionReason/, 'the failure offers the omission option');
assert.match(r.out, /add a rights-cleared photograph/, 'the failure offers the photograph option');

r = run({ old: post('tags: [kpop]').replace('2026-11-01', '2026-10-01') });
assert.equal(r.status, 0, 'posts published before the policy date are not checked');

console.log('PASS cover-omission fixture test: valid omission accepted; leftover image fields, short reasons and bare posts rejected with both options offered.');
