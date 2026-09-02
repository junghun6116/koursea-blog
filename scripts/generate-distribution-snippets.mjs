import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const root = process.cwd();
const postsDirectory = join(root, 'src/content/posts');
const outputDirectory = join(root, 'dist');
const outputFile = join(outputDirectory, 'distribution-snippets.json');

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { body: markdown, data: {} };
  const data = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.+)\s*$/);
    if (!field) continue;
    data[field[1]] = field[2].replace(/^(["'])(.*)\1$/, '$2');
  }
  return { body: markdown.slice(match[0].length), data };
}

function normalizeLabel(line) {
  return line.replace(/^\s*#+\s*/, '').replace(/^\s*[-*]\s*/, '').replaceAll('*', '').replace(/:\s*$/, '').trim().toLowerCase();
}

function extractDistributionSection(body) {
  const lines = body.split('\n');
  let inDistribution = false;
  let current = null;
  const values = { threadsPost: [], redditAnswer: [] };

  for (const line of lines) {
    if (/^##\s+Social\s*&\s*Community\s+Distribution\s+Snippets\s*$/i.test(line.trim())) {
      inDistribution = true;
      current = null;
      continue;
    }
    if (!inDistribution) continue;
    if (/^##\s+/.test(line)) break;

    const label = normalizeLabel(line);
    if (/^threads(?:\s*&\s*x(?:\s*\(twitter\))?\s*hook| post)?$/.test(label)) { current = 'threadsPost'; continue; }
    if (/^reddit(?: community reply template| answer| post)?$/.test(label)) { current = 'redditAnswer'; continue; }
    if (current) values[current].push(line);
  }

  const clean = (linesToClean) => linesToClean.join('\n').replace(/^```\w*\s*\n?|\n?```\s*$/g, '').trim();
  return inDistribution ? { threadsPost: clean(values.threadsPost), redditAnswer: clean(values.redditAnswer) } : null;
}

const snippets = readdirSync(postsDirectory)
  .filter((file) => file.endsWith('.md'))
  .sort()
  .flatMap((file) => {
    const slug = basename(file, '.md');
    const { body, data } = parseFrontmatter(readFileSync(join(postsDirectory, file), 'utf8'));
    const extracted = extractDistributionSection(body);
    if (!extracted) return [];
    return [{
      slug,
      title: data.title ?? slug,
      url: data.canonicalUrl ?? `https://blog.koursea.com/posts/${slug}/`,
      threadsPost: extracted.threadsPost,
      redditAnswer: extracted.redditAnswer
    }];
  });

if (!existsSync(outputDirectory)) mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputFile, `${JSON.stringify(snippets, null, 2)}\n`, 'utf8');
console.log(`Generated distribution-snippets.json with ${snippets.length} record(s).`);
