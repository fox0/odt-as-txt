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
        // 1. Вырезаем аннотации (комментарии) целиком — вместе с содержимым
        .replace(/<office:annotation(?:\s[^>]*)?>[\s\S]*?<\/office:annotation>/g, '')
        .replace(/<office:annotation-end[^>]*\/>/g, '')
        // // Абзацы и заголовки → двойной перевод строки
        // .replace(/<\/text:(p|h)>/g, '\n\n')
        // // Перенос строки внутри абзаца
        // .replace(/<text:line-break\/>/g, '\n')
        // // Табуляция и пробелы
        // .replace(/<text:tab\/>/g, '\t')
        // .replace(/<text:s\/>/g, ' ')
        // Вырезаем все оставшиеся теги
        .replace(/<[^>]+>/g, '')
        // // Декодируем базовые XML-сущности
        // .replace(/&lt;/g, '<')
        // .replace(/&gt;/g, '>')
        // .replace(/&amp;/g, '&')
        // .replace(/&quot;/g, '"')
        // .replace(/&apos;/g, "'")
        // Схлопываем лишние пустые строки
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
