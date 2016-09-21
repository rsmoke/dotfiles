"use strict";
var vscode = require('vscode');
var rubocop_1 = require('./rubocop');
var rubocopAutocorrect_1 = require('./rubocopAutocorrect');
function activate(context) {
    'use strict';
    var diag = vscode.languages.createDiagnosticCollection('ruby');
    context.subscriptions.push(diag);
    var rubocop = new rubocop_1.Rubocop(diag);
    var rubocopAutocorrect = new rubocopAutocorrect_1.RubocopAutocorrect(diag);
    var disposable = vscode.commands.registerCommand('ruby.rubocop', function () {
        var document = vscode.window.activeTextEditor.document;
        rubocop.execute(document);
    });
    vscode.commands.registerCommand('ruby.rubocopAutocorrect', function () {
        var document = vscode.window.activeTextEditor.document;
        rubocopAutocorrect.execute(document);
    });
    context.subscriptions.push(disposable);
    vscode.workspace.onDidSaveTextDocument(function (e) {
        if (rubocop.isOnSave) {
            rubocop.execute(e);
        }
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map