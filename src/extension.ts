import * as vscode from 'vscode';
import { extractPlainText } from './text';

/**
 * Провайдер содержимого для виртуальной схемы `odt-plain`.
 *
 * VS Code вызывает provideTextDocumentContent, когда открывает документ
 * с URI схемы `odt-plain`. Возвращённая строка отображается в обычном
 * текстовом редакторе — со всеми штатными возможностями: Ctrl+F, выделение,
 * копирование, переходы по строкам, мини-карта, темы.
 *
 * Документ автоматически read-only: VS Code не позволяет редактировать
 * содержимое, полученное от TextDocumentContentProvider.
 */
class OdtContentProvider implements vscode.TextDocumentContentProvider {

    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        // Реальный путь к .odt хранится в query-части виртуального URI.
        const realUri = vscode.Uri.file(uri.query);

        try {
            const buf = await vscode.workspace.fs.readFile(realUri);
            return await extractPlainText(buf);
        } catch (e: any) {
            return `Ошибка чтения ODT: ${e.message}`;
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    const provider = new OdtContentProvider();

    // Регистрируем схему `odt-plain` — теперь VS Code знает,
    // у кого спрашивать содержимое для URI этой схемы.
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider('odt-plain', provider)
    );

    // Команда открытия. VS Code передаёт URI файла из контекстного меню
    // первым аргументом. Если команда вызвана программно (без URI) —
    // попробуем взять активный редактор.
    context.subscriptions.push(
        vscode.commands.registerCommand('odtViewer.open', async (uri?: vscode.Uri) => {
            const target = uri ?? vscode.window.activeTextEditor?.document.uri;

            if (!target) {
                vscode.window.showErrorMessage('Не удалось определить файл для открытия.');
                return;
            }

            // Собираем виртуальный URI:
            //   scheme  = odt-plain  (наш провайдер)
            //   path    = имя файла + .md  (определяет язык → markdown)
            //   query   = реальный fsPath (провайдеру нужно знать, что читать)
            const fileName = target.path.split('/').pop() ?? 'document.odt';
            const virtualUri = vscode.Uri.from({
                scheme: 'odt-plain',
                path: '/' + fileName + '.md',
                query: target.fsPath,
            });

            const doc = await vscode.workspace.openTextDocument(virtualUri);
            await vscode.window.showTextDocument(doc, { preview: false });
        })
    );
}

export function deactivate() { }
