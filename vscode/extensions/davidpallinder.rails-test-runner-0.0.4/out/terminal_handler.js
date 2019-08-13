"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class TerminalHandler {
    constructor() {
        this.terminal = this.createTerminal();
    }
    retrieveTerminal() {
        if (!this.terminal) {
            this.terminal = this.createTerminal();
        }
        return this.terminal;
    }
    destroyTerminal(terminal) {
        if (terminal) {
            if (terminal === this.terminal) {
                this.terminal = null;
            }
        }
        else {
            this.terminal = null;
        }
    }
    createTerminal() {
        return (vscode.window.createTerminal('Rails Test Runner'));
    }
    clearTerminal() {
        vscode.commands.executeCommand('workbench.action.terminal.clear');
    }
}
exports.default = TerminalHandler;
//# sourceMappingURL=terminal_handler.js.map