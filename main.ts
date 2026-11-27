// FridayFinder — the hand-in program for black-friday-deal-finder-01.
// Node 22, standard library only. It takes the static site in app/ and
// the screenshots in screenshots/ from beside this file, copies them into
// the output directory, and writes output/dossier.json with the vendored
// make.fun library so the grader can rebuild the same dossier byte for
// byte. Run it as:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and /output is used.
// The program is deterministic: it writes the same bytes on every run.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory holding this file.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function listShots() {
  const dir = join(repoRoot, 'screenshots');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => !name.startsWith('.')).sort();
}

// Fail loudly instead of handing in a half-empty entry.
const shots = listShots();
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}
if (!existsSync(join(repoRoot, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing');
}

mkdirSync(outputDir, { recursive: true });
copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));
copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

// Caps from the gate: at most 4 screenshots of 256 KiB, at most 993
// files / 16 MiB under app/, dossier text capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`wrote ${shots.length} screenshots and dossier.json to ${outputDir}`);
