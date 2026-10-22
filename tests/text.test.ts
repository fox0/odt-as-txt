import { it, expect, describe } from 'vitest';
import { xmlToPlainText } from '../src/text';

describe('xmlToPlainText: аннотации', () => {
    it('удаляет две аннотации и сохраняет текст с правильной вёрсткой', () => {
        const xml = 'A1<office:annotation>...</office:annotation> A2<office:annotation-end/> A3<office:annotation>...</office:annotation> A4<office:annotation-end/> A5';
        const result = xmlToPlainText(xml);
        expect(result).toBe('A1 A2 A3 A4 A5');
    });
});

describe('xmlToPlainText: TexMaths', () => {
    it('<svg:desc>...§display§...', () => {
        const xml = '<svg:title>TexMaths</svg:title><svg:desc>14§display§s§svg§600§FALSE§</svg:desc>';
        const result = xmlToPlainText(xml);
        expect(result).toBe('$s$');
    });

    it('<svg:desc>...§display§...§png§...', () => {
        const xml = '<svg:title>TexMaths</svg:title><svg:desc>12§display§[s, s_3, s_5, g]§png§600§FALSE§</svg:desc>';
        const result = xmlToPlainText(xml);
        expect(result).toBe('$[s, s_3, s_5, g]$');
    });

    it('<svg:desc>...§latex§...', () => {
        const xml =
            '<svg:title>TexMaths</svg:title><svg:desc>14§latex§\\begin{align}\n' +
            '&amp; a = F(s), \\quad s \\in S, g \\in S, a \\in A \\tag{1.1} \\\\\n' +
            '&amp; S = \\{s_0, s_1, s_2, \\ldots, s_n\\} \\tag{1.2} \\\\\n' +
            '&amp; A = \\{a_0, a_1, a_2, \\ldots, a_m\\} \\tag{1.3}\n' +
            '\\end{align}§svg§600§FALSE§</svg:desc>';

        const result = xmlToPlainText(xml);
        expect(result).toBe(
            '$$\n' +
            '\\begin{align}\n' +
            '& a = F(s), \\quad s \\in S, g \\in S, a \\in A \\tag{1.1} \\\\\n' +
            '& S = \\{s_0, s_1, s_2, \\ldots, s_n\\} \\tag{1.2} \\\\\n' +
            '& A = \\{a_0, a_1, a_2, \\ldots, a_m\\} \\tag{1.3}\n' +
            '\\end{align}\n' +
            '$$');
    });

    it('<svg:desc>...§latex§... 1.6', () => {
        const xml =
            '<svg:title>TexMaths</svg:title><svg:desc>14§latex§\\begin{align}\n' +
            '&amp; \\langle X, T(X), U, G, M \\rangle \\tag{1.6}\n' +
            '\\end{align}§svg§600§FALSE§</svg:desc>';

        const result = xmlToPlainText(xml);
        expect(result).toBe(
            '$$\n' +
            '\\begin{align}\n' +
            '& \\langle X, T(X), U, G, M \\rangle \\tag{1.6}\n' +
            '\\end{align}\n' +
            '$$');
    });

    it('<svg:desc>...§latex§... text:p', () => {
        const xml =
            '<text:p text:style-name="P49"><draw:frame text:anchor-type="as-char" svg:y="-0.265cm" draw:z-index="16" draw:name="Фигура11" draw:style-name="gr1" draw:text-style-name="P18" svg:width="10.529cm" svg:height="0.528cm"><draw:image xlink:href="Pictures/1000539500001D630000017AFDE999EB.svg" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad" draw:mime-type="image/svg+xml"><text:p/></draw:image><draw:image xlink:href="Pictures/100000010000011C0000000E862B143D.png" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad" draw:mime-type="image/png"/><svg:title>TexMaths</svg:title><svg:desc>14§latex§\\begin{align}\n' +
            '&amp; \\langle X, T(X), U, G, M \\rangle \\tag{1.6}\n' +
            '\\end{align}§svg§600§FALSE§</svg:desc></draw:frame></text:p>';

        const result = xmlToPlainText(xml);
        expect(result).toBe(
            '$$\n' +
            '\\begin{align}\n' +
            '& \\langle X, T(X), U, G, M \\rangle \\tag{1.6}\n' +
            '\\end{align}\n' +
            '$$');
    });

    it('<svg:desc>...§latex§... 1.7', () => {
        const xml =
            '<svg:title>TexMaths</svg:title><svg:desc>14§latex§\\begin{align}\n' +
            '&amp; \\langle S, A, P, R, \\gamma \\rangle, \\quad \\gamma \\in [0; 1] \\tag{1.7}\n' +
            '\\end{align}§svg§600§FALSE§</svg:desc>';

        const result = xmlToPlainText(xml);
        expect(result).toBe(
            '$$\n' +
            '\\begin{align}\n' +
            '& \\langle S, A, P, R, \\gamma \\rangle, \\quad \\gamma \\in [0; 1] \\tag{1.7}\n' +
            '\\end{align}\n' +
            '$$');
    });
});

describe('xmlToPlainText: not break', () => {
    it('ничего не удаляет', () => {
        const xml =
            '<text:p text:style-name="P59">Лингвистическая переменная — это переменная, значениями которой являются не числа, а слова или словосочетания естественного языка. Формально она задаётся кортежем:</text:p><text:p text:style-name="P49"><draw:frame text:anchor-type="as-char" svg:y="-0.265cm" draw:z-index="16" draw:name="Фигура11" draw:style-name="gr1" draw:text-style-name="P18" svg:width="10.529cm" svg:height="0.528cm"><draw:image xlink:href="Pictures/1000539500001D630000017AFDE999EB.svg" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad" draw:mime-type="image/svg+xml"><text:p/></draw:image><draw:image xlink:href="Pictures/100000010000011C0000000E862B143D.png" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad" draw:mime-type="image/png"/><svg:title>TexMaths</svg:title><svg:desc>14§latex§\\begin{align}\n' +
            '&amp; \\langle X, T(X), U, G, M \\rangle \\tag{1.6}\n' +
            '\\end{align}§svg§600§FALSE§</svg:desc></draw:frame></text:p><text:p text:style-name="P60">где</text:p><text:p text:style-name="P60"><text:span text:style-name="T112"><draw:frame text:anchor-type="as-char" svg:y="-0.333cm" draw:z-index="11" draw:name="Фигура12" draw:style-name="gr1" draw:text-style-name="P18" svg:width="0.417cm" svg:height="0.334cm"><draw:image xlink:href="Pictures/10000B320000012B000000F0DBFA74B5.svg" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad" draw:mime-type="image/svg+xml"><text:p/></draw:image><draw:image xlink:href="Pictures/100000010000000B00000009266E37F1.png" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad" draw:mime-type="image/png"/><svg:title>TexMaths</svg:title><svg:desc>14§display§X§svg§600§FALSE§</svg:desc></draw:frame></text:span><text:s/>— имя переменной (например, «температура»);</text:p>';
        const result = xmlToPlainText(xml);
        expect(result).toBe(
            'Лингвистическая переменная — это переменная, значениями которой являются не числа, а слова или словосочетания естественного языка. Формально она задаётся кортежем:\n' +
            '\n' +
            '$$\n' +
            '\\begin{align}\n' +
            '& \\langle X, T(X), U, G, M \\rangle \\tag{1.6}\n' +
            '\\end{align}\n' +
            '$$\n' +
            '\n' +
            'где\n' +
            '\n' +
            '$X$ — имя переменной (например, «температура»);'
        );
    });
});
