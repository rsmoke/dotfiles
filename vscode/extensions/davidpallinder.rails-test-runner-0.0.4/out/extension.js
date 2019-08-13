'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const runner_1 = require("./runner");
const state_handler_1 = require("./state_handler");
const terminal_handler_1 = require("./terminal_handler");
const terminalHandler = new terminal_handler_1.default();
function activate(context) {
    const stateHandler = new state_handler_1.default(context.workspaceState);
    const extensionRunner = new runner_1.default(stateHandler, terminalHandler);
    vscode_1.window.onDidCloseTerminal((terminal) => {
        terminalHandler.destroyTerminal(terminal);
    });
    vscode_1.commands.registerCommand('extension.runAllSpecs', () => {
        extensionRunner.runAllSpecs();
    });
    vscode_1.commands.registerCommand('extension.runAllSpecsInFolder', () => {
        console.log('Running all specs in folder');
    });
    vscode_1.commands.registerCommand('extension.runSpec', () => {
        extensionRunner.runSpec();
    });
    vscode_1.commands.registerCommand('extension.runSpecFromLine', () => {
        extensionRunner.runSpecFromLine();
    });
    vscode_1.commands.registerCommand('extension.runLastSpec', () => {
        extensionRunner.runLastSpec();
    });
}
exports.activate = activate;
function deactivate() {
    terminalHandler.destroyTerminal();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map