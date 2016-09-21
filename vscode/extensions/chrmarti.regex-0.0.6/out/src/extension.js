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
    context.subscriptions.push(vscode.commands.registerCommand('extension.toggleRegexPreview', toggleRegexPreview));
    languages.forEach(function (language) {
        context.subscriptions.push(vscode.languages.registerCodeLensProvider(language, { provideCodeLenses: provideCodeLenses }));
    });
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(function () { return updateDecorators(findRegexEditor()); }));
    var interval = setInterval(function () { return updateDecorators(null); }, 5000);
    context.subscriptions.push({ dispose: function () { return clearInterval(interval); } });
    function provideCodeLenses(document, token) {
        var matches = findRegexes(document);
        return matches.map(function (match) { return new vscode.CodeLens(match.range, {
            title: 'Test Regex...',
            command: 'extension.toggleRegexPreview',
            arguments: [match]
        }); });
    }
    var enabled = false;
    function toggleRegexPreview(initialRegexMatch) {
        if (enabled = !enabled || !!initialRegexMatch && !!initialRegexMatch.regex) {
            var visibleEditors = vscode.window.visibleTextEditors;
            if (visibleEditors.length === 1) {
                return openLoremIpsum(visibleEditors[0].viewColumn + 1, initialRegexMatch);
            }
            else {
                updateDecorators(findRegexEditor(), initialRegexMatch);
            }
        }
        else {
            decorators.forEach(function (decorator) { return decorator.dispose(); });
        }
    }
    function openLoremIpsum(column, initialRegexMatch) {
        return vscode.workspace.openTextDocument(matchesFileUri).then(function (document) {
            return vscode.window.showTextDocument(document, column, true);
        }).then(function (editor) {
            return editor.edit(function (builder) {
                builder.insert(new vscode.Position(0, 0), matchesFileContent);
            }).then(function () {
                updateDecorators(findRegexEditor(), initialRegexMatch);
            });
        }).then(null, function (reason) {
            vscode.window.showErrorMessage(reason);
        });
    }
    function updateDecorators(regexEditor, initialRegexMatch) {
        if (!enabled) {
            return;
        }
        // TODO: figure out why originEditor.document is sometimes a different object
        if (regexEditor && initialRegexMatch && initialRegexMatch.document && initialRegexMatch.document.uri.toString() === regexEditor.document.uri.toString()) {
            initialRegexMatch.document = regexEditor.document;
        }
        var remove = new Map(decorators);
        vscode.window.visibleTextEditors.forEach(function (editor) {
            remove.delete(editor);
            applyDecorator(editor, regexEditor, initialRegexMatch);
        });
        remove.forEach(function (decorator) { return decorator.dispose(); });
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
            this.disposables.push({ dispose: function () {
                    matchEditor.setDecorations(matchHighlight, []);
                    matchEditor.setDecorations(regexHighlight, []);
                } });
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
            var matches = regex && regexEditor !== this.matchEditor ? findMatches(regex, this.matchEditor.document) : [];
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
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map