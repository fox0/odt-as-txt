import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { it, expect, describe } from 'vitest';
import { xmlToPlainText } from '../src/text';

describe('xmlToPlainText', () => {
    const FIXTURES_DIR = join(__dirname, 'fixtures');
    const read = (name: string) => readFileSync(join(FIXTURES_DIR, name), 'utf8');
    const all = new Set(readdirSync(FIXTURES_DIR));
    const cases = [...all]
        .filter(f => f.endsWith('.xml'))
        .map(f => f.slice(0, -4))
        .filter(b => all.has(`${b}.md`))
        .sort();

    it('fixtures: у каждой пары есть оба файла', () => {
        expect(cases.length).toBeGreaterThan(0);
    });

    it.each(cases)('%s.xml', (base) => {
        const result = xmlToPlainText(read(`${base}.xml`));
        expect(result).toBe(read(`${base}.md`));
    });
});
