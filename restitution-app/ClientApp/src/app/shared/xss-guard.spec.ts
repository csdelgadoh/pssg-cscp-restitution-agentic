import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(SRC).filter((f) => /\.(ts|html)$/.test(f) && !f.endsWith('.spec.ts'));
const rel = (f: string) => f.slice(SRC.length + 1).replace(/\\/g, '/');

describe('XSS guard (VULN-001)', () => {
  it('never bypasses the Angular sanitizer (AC4)', () => {
    const hits = files.filter((f) => /bypassSecurityTrust/.test(readFileSync(f, 'utf8')));
    expect(hits.map(rel)).toEqual([]);
  });

  it('allows [innerHTML] only in the reviewed places (AC6)', () => {
    const hits = files.filter((f) => /\[innerHTML\]/.test(readFileSync(f, 'utf8'))).map(rel).sort();
    expect(hits).toEqual([
      'app/shared/alert/alert.component.html',
      'app/shared/restitution/review/restitution-review.component.html'
    ]);
  });
});
