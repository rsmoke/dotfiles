'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const runner_1 = require("./runner");
const state_handler_1 = require("./state_handler");
const terminal_handler_1 = require("./terminal_handler");
const terminalHandler = new terminal_handler_1.default();
function activate(context) {
    const stateHandler = new state_handler_1.default(context.workspaceState);
    const configuration = vscode_1.workspace.getConfiguration('railsTestRunner');
    const extensionRunner = new runner_1.default(stateHandler, terminalHandler, configuration);
    vscode_1.window.onDidCloseTerminal((terminal) => {
        terminalHandler.destroyTerminal(terminal);
    });
    vscode_1.commands.registerCommand('railsTestRunner.runAllTests', () => {
        extensionRunner.runAllTests();
    });
    vscode_1.commands.registerCommand('railsTestRunner.runAllTestsInFolder', (fileUri) => {
        extensionRunner.runAllTestsInFolder(fileUri);
    });
    vscode_1.commands.registerCommand('railsTestRunner.runAllTestsInFile', () => {
        extensionRunner.runAllTestsInFile();
    });
    vscode_1.commands.registerCommand('railsTestRunner.runTestAtLine', () => {
        extensionRunner.runTestAtLine();
    });
    vscode_1.commands.registerCommand('railsTestRunner.runLastTests', () => {
        extensionRunner.runLastTests();
    });
    vscode_1.commands.registerCommand('railsTestRunner.runLastFailedTests', () => {
        extensionRunner.runLastFailedTests();
    });
    console.log('Rails Test Runner was activated');
}
exports.activate = activate;
function deactivate() {
    terminalHandler.destroyTerminal();
}
exports.deactivate = deactivate;
//# sourceMappingURL=rails_test_runner.js.map