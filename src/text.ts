// WARNING: vibe-code chat.geepseek
//
import * as JSZip from 'jszip';

/**
 * Извлекает plain text из бинарного содержимого .odt.
 * Никаких зависимостей от vscode — чистый парсер.
 */
export async function extractPlainText(buf: Uint8Array): Promise<string> {
    const zip = await JSZip.loadAsync(buf);
    const contentFile = zip.file('content.xml');
    if (!contentFile) {
        throw new Error('content.xml не найден — файл не является ODT?');
    }

    const xml = await contentFile.async('string');
    return xmlToPlainText(xml);
}

/**
 * Превращает content.xml в plain text.
 * Вынесено отдельно, чтобы можно было тестировать без ZIP.
 */
export function xmlToPlainText(xml: string): string {
    return xml
        .replace(/<office:annotation(?:\s[^>]*)?>[\s\S]*?<\/office:annotation>/g, '')
        .replace(/<office:annotation-end[^>]*\/>/g, '')
        .replace(
            /<svg:title>TexMaths<\/svg:title><svg:desc>[^<]*?§display§([\s\S]*?)§(?:svg|png)§[^<]*?<\/svg:desc>/g,
            (_, tex) => '$' + tex.trim() + '$'
        )
        .replace(
            /<svg:title>TexMaths<\/svg:title><svg:desc>[^<]*?§latex§([\s\S]*?)§(?:svg|png)§[^<]*?<\/svg:desc>/g,
            (_, tex) => '$$\n' + tex.trim() + '\n$$'
        )
        .replace(/<text:h[^>]*>([\s\S]*?)<\/text:h>/g, '# $1\n\n')
        .replace('<text:soft-page-break/>', '')
        .replace(/<\/text:p>/g, '\n\n')
        // // Перенос строки внутри абзаца
        // .replace(/<text:line-break\/>/g, '\n')
        // // Табуляция и пробелы
        // .replace(/<text:tab\/>/g, '\t')
        .replace(/<text:s\/>/g, ' ')

        // Вырезаем все оставшиеся теги
        .replace(/<[^>]+>/g, '')

        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
