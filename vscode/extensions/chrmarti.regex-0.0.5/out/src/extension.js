/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var fs = require('fs');
var path = require('path');
var vscode = require('vscode');
function activate(context) {
    var regexRegex = /(^|\s|[()={},:?;])(\/((?:\\\/|\[[^\]]*\]|[^/])+)\/([gimuy]*))(\s|[()={},:?;]|$)/g;
    var regexHighlight = vscode.window.createTextEditorDecorationType({ backgroundColor: 'rgba(100,100,100,.35)' });
    var matchHighlight = vscode.window.createTextEditorDecorationType({ backgroundColor: 'rgba(255,255,0,.35)' });
    var matchesFilePath = context.asAbsolutePath('resources/sample.txt');
    var matchesFileContent = fs.readFileSync(matchesFilePath, 'utf8');
    var matchesFileUri = vscode.Uri.parse("untitled:" + path.sep + "Regex Matches");
    var languages = ['javascript', 'typescript'];
    var decorators = new Map();
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.showRegexPreview', showRegexPreview));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.makeRegexPreview', function (editor) { return applyDecorator(editor); }));
    languages.forEach(function (language) {
        context.subscriptions.push(vscode.languages.registerCodeLensProvider(language, { provideCodeLenses: provideCodeLenses }));
    });
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(tryApplyDecorator));
    function provideCodeLenses(document, token) {
        var matches = findRegexes(document);
        return matches.map(function (match) { return new vscode.CodeLens(match.range, {
            title: 'Test Regex...',
            command: 'extension.showRegexPreview',
            arguments: [match]
        }); });
    }
    function showRegexPreview(originEditor, builder, initialRegexMatch) {
        var rootPath = vscode.workspace.rootPath;
        if (!rootPath) {
            vscode.window.showWarningMessage('No folder opened yet.');
            return;
        }
        // TODO: figure out why originEditor.document is sometimes a different object
        if (initialRegexMatch && initialRegexMatch.document && initialRegexMatch.document.uri.toString() === originEditor.document.uri.toString()) {
            initialRegexMatch.document = originEditor.document;
        }
        return vscode.workspace.openTextDocument(matchesFileUri).then(function (document) {
            return vscode.window.showTextDocument(document, originEditor.viewColumn + 1, true);
        }).then(function (editor) {
            if (editor.document.lineCount === 1 && !editor.document.getText().length) {
                editor.edit(function (builder) {
                    builder.insert(new vscode.Position(0, 0), matchesFileContent);
                }).then(function () { return editor; });
            }
            return editor;
        }).then(function (editor) {
            tryApplyDecorator(editor, originEditor, initialRegexMatch);
        }).then(null, function (reason) {
            vscode.window.showErrorMessage(reason);
        });
    }
    function tryApplyDecorator(matchEditor, initialRegexEditor, initialRegexMatch) {
        if (matchEditor && matchEditor.document.uri.toString() === matchesFileUri.toString()) {
            applyDecorator(matchEditor, initialRegexEditor, initialRegexMatch);
        }
    }
    function applyDecorator(matchEditor, initialRegexEditor, initialRegexMatch) {
        var decorator = decorators.get(matchEditor);
        var newDecorator = !decorator;
        if (newDecorator) {
            decorator = new RegexMatchDecorator(matchEditor);
            context.subscriptions.push(decorator);
            decorators.set(matchEditor, decorator);
        }
        if (newDecorator || initialRegexEditor || initialRegexMatch) {
            decorator.apply(initialRegexEditor, initialRegexMatch);
        }
    }
    function discardDecorator(matchEditor) {
        decorators.delete(matchEditor);
    }
    var RegexMatchDecorator = (function () {
        function RegexMatchDecorator(matchEditor) {
            var _this = this;
            this.matchEditor = matchEditor;
            this.disposables = [];
            this.disposables.push(vscode.workspace.onDidCloseTextDocument(function (e) {
                if (_this.stableRegexEditor && e === _this.stableRegexEditor.document) {
                    _this.stableRegexEditor = null;
                    _this.stableRegexMatch = null;
                    matchEditor.setDecorations(matchHighlight, []);
                }
                else if (e === matchEditor.document) {
                    _this.dispose();
                }
            }));
            this.disposables.push(vscode.workspace.onDidChangeTextDocument(function (e) {
                if ((_this.stableRegexEditor && e.document === _this.stableRegexEditor.document) || e.document === matchEditor.document) {
                    _this.update();
                }
            }));
            this.disposables.push(vscode.window.onDidChangeTextEditorSelection(function (e) {
                if (_this.stableRegexEditor && e.textEditor === _this.stableRegexEditor) {
                    _this.stableRegexMatch = null;
                    _this.update();
                }
            }));
            this.disposables.push(vscode.window.onDidChangeActiveTextEditor(function (e) {
                _this.update();
            }));
        }
        RegexMatchDecorator.prototype.apply = function (stableRegexEditor, stableRegexMatch) {
            this.stableRegexEditor = stableRegexEditor;
            this.stableRegexMatch = stableRegexMatch;
            this.update();
        };
        RegexMatchDecorator.prototype.dispose = function () {
            discardDecorator(this.matchEditor);
            this.disposables.forEach(function (disposable) {
                disposable.dispose();
            });
        };
        RegexMatchDecorator.prototype.update = function () {
            var regexEditor = this.stableRegexEditor = findRegexEditor() || this.stableRegexEditor;
            var regex = regexEditor && findRegexAtCaret(regexEditor);
            if (this.stableRegexMatch) {
                if (regex || !regexEditor || regexEditor.document !== this.stableRegexMatch.document) {
                    this.stableRegexMatch = null;
                }
                else {
                    regex = this.stableRegexMatch;
                }
            }
            var matches = regex ? findMatches(regex, this.matchEditor.document) : [];
            this.matchEditor.setDecorations(matchHighlight, matches.map(function (match) { return match.range; }));
            if (regexEditor) {
                regexEditor.setDecorations(regexHighlight, (this.stableRegexMatch || regexEditor !== vscode.window.activeTextEditor) && regex ? [regex.range] : []);
            }
        };
        return RegexMatchDecorator;
    }());
    function findRegexEditor() {
        var activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || languages.indexOf(activeEditor.document.languageId) === -1) {
            return null;
        }
        return activeEditor;
    }
    function findRegexAtCaret(editor) {
        var anchor = editor.selection.anchor;
        var text = editor.document.lineAt(anchor).text;
        var match;
        regexRegex.lastIndex = 0;
        while ((match = regexRegex.exec(text)) && (match.index + match[1].length + match[2].length < anchor.character))
            ;
        if (match && match.index + match[1].length <= anchor.character) {
            return createRegexMatch(editor.document, anchor.line, match);
        }
    }
    function findRegexes(document) {
        var matches = [];
        for (var i = 0; i < document.lineCount; i++) {
            var line = document.lineAt(i);
            var match = void 0;
            regexRegex.lastIndex = 0;
            while ((match = regexRegex.exec(line.text))) {
                matches.push(createRegexMatch(document, i, match));
            }
        }
        return matches;
    }
    function createRegexMatch(document, line, match) {
        var regex = createRegex(match[3], match[4]);
        if (regex) {
            return {
                document: document,
                regex: regex,
                range: new vscode.Range(line, match.index + match[1].length, line, match.index + match[1].length + match[2].length)
            };
        }
    }
    function createRegex(pattern, flags) {
        try {
            return new RegExp(pattern, flags);
        }
        catch (e) {
        }
    }
    function findMatches(regexMatch, document) {
        var text = document.getText();
        var matches = [];
        var regex = regexMatch.regex;
        var match;
        while ((regex.global || !matches.length) && (match = regex.exec(text))) {
            matches.push({
                range: new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length))
            });
        }
        return matches;
    }
    vscode.window.visibleTextEditors.forEach(function (editor) { return tryApplyDecorator(editor); });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map