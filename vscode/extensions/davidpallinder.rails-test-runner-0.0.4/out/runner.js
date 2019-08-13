"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class Runner {
    constructor(stateHandler, terminalHandler, config) {
        this.stateHandler = stateHandler;
        this.terminalHandler = terminalHandler;
        this.config = config;
    }
    runAllTests() {
        this.runTests('');
    }
    runAllTestsInFolder(fileUri) {
        this.runTests(fileUri.fsPath);
    }
    runAllTestsInFile() {
        const fileName = this.retrieveFileName();
        this.runTests(fileName);
    }
    runLastTests() {
        if (this.stateHandler.get('lastFile')) {
            this.runTests(this.stateHandler.get('lastFile'));
        }
        else {
            vscode_1.window.showInformationMessage('Couldnt run the last spec again since no spec has been run.');
        }
    }
    runLastFailedTests() {
        const fileName = this.retrieveFileName();
        this.runTests('', '--only-failures');
    }
    runTestAtLine() {
        const fileName = this.retrieveFileName(true);
        this.runTests(fileName);
    }
    retrieveFileName(retrieveLineNumber) {
        if (!vscode_1.window.activeTextEditor) {
            return;
        }
        const editor = vscode_1.window.activeTextEditor;
        let fileName = editor.document.fileName;
        const currentPosition = vscode_1.window.activeTextEditor.selection.active;
        const lineNumber = retrieveLineNumber ? currentPosition.line + 1 : 0;
        if (fileName.indexOf('_spec.rb') === -1) {
            vscode_1.window.showInformationMessage('File does not appear to be a spec file (missing _spec in the filename?)');
            return;
        }
        if (lineNumber !== 0) {
            fileName = `${fileName}:${lineNumber}`;
        }
        return fileName;
    }
    runTests(path, commandLineArguments = '') {
        let commandToRun = '';
        if (this.shouldFailFast()) {
            commandToRun = `${this.command()} ${commandLineArguments} --fail-fast --order ${path}`;
        }
        else {
            commandToRun = `${this.command()} ${commandLineArguments} ${path}`;
        }
        const terminal = this.terminalHandler.retrieveTerminal();
        this.stateHandler.set('lastFile', path);
        terminal.show(!this.shouldFocusTerminal);
        if (this.shouldClearTerminal()) {
            this.terminalHandler.clearTerminal();
        }
        terminal.sendText(commandToRun);
    }
    command() {
        return this.config.get('rspecCommand');
    }
    shouldFailFast() {
        return this.config.get('rspec.failFast');
    }
    shouldFocusTerminal() {
        return this.config.get('focusTerminal');
    }
    shouldClearTerminal() {
        return this.config.get('clearTerminal');
    }
}
exports.default = Runner;
//# sourceMappingURL=runner.js.map