import * as vscode from 'vscode';
import { extractPlainText } from './text';

class OdtDocument implements vscode.CustomDocument {
    constructor(public readonly uri: vscode.Uri) {}

    dispose(): void {}
}

class OdtEditorProvider implements vscode.CustomReadonlyEditorProvider<OdtDocument> {

    // Вызывается, когда VS Code собирается открыть .odt.
    // Здесь можно прочитать/распарсить файл заранее, чтобы не делать
    // это повторно при каждом рендере. Мы оставим ленивое чтение в Webview.
    async openCustomDocument(
        uri: vscode.Uri,
        _openContext: vscode.CustomDocumentOpenContext,
        _token: vscode.CancellationToken
    ): Promise<OdtDocument> {
        return new OdtDocument(uri);
    }

    // Вызывается один раз на вкладку. Здесь наполняем Webview.
    async resolveCustomEditor(
        document: OdtDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: false, // нам JS не нужен
        };

        // Читаем ODT и извлекаем plain text
        let text: string;
        try {
            const buf = await vscode.workspace.fs.readFile(document.uri);
            text = await extractPlainText(buf);
        } catch (e: any) {
            text = `Ошибка чтения ODT: ${e.message}`;
        }

        // Экранируем HTML, чтобы текст отображался как есть
        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        webviewPanel.webview.html = `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: var(--vscode-editor-font-family);
                        font-size: var(--vscode-editor-font-size);
                        color: var(--vscode-editor-foreground);
                        background: var(--vscode-editor-background);
                        padding: 1em;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                </style>
            </head>
            <body>${escaped}</body>
            </html>
        `;
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider(
            'odtViewer.readonly',              // == viewType из package.json
            new OdtEditorProvider(),
            {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false,
            }
        )
    );
}

export function deactivate() {}
