import { it, expect, describe } from 'vitest';
import { xmlToPlainText } from '../src/text';

describe('xmlToPlainText: аннотации', () => {
    it('удаляет две аннотации и сохраняет текст с правильной вёрсткой', () => {
        const xml = 'A1<office:annotation>...</office:annotation> A2<office:annotation-end/> A3<office:annotation>...</office:annotation> A4<office:annotation-end/> A5';
        const result = xmlToPlainText(xml);
        expect(result).toBe('A1 A2 A3 A4 A5');
    });
});
