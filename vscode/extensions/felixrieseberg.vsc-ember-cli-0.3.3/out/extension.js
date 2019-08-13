"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const embercli = require("./src/ember-cli");
const emberOps = require("./src/ember-ops");
var emberManager;
var installed = false;
function activate() {
    execute("setupProject");
    // Register Commands
    vscode_1.commands.registerCommand("extension.addon", () => execute("addon"));
    vscode_1.commands.registerCommand("extension.setupProject", () => execute("setupProject"));
    vscode_1.commands.registerCommand("extension.build", () => execute("build"));
    vscode_1.commands.registerCommand("extension.serve", () => execute("serve"));
    vscode_1.commands.registerCommand("extension.init", () => execute("init"));
    vscode_1.commands.registerCommand("extension.new", () => execute("new"));
    vscode_1.commands.registerCommand("extension.install", () => execute("install"));
    vscode_1.commands.registerCommand("extension.generate", () => execute("blueprint", ["generate"]));
    vscode_1.commands.registerCommand("extension.destroy", () => execute("blueprint", ["destroy"]));
    vscode_1.commands.registerCommand("extension.version", () => execute('version'));
    vscode_1.commands.registerCommand("extension.test", () => execute("test"));
    vscode_1.commands.registerCommand("extension.testServer", () => execute("testServer"));
    vscode_1.commands.registerCommand("extension.installTypings", () => execute("installTypings"));
}
exports.activate = activate;
function execute(cmd, arg) {
    if (!emberManager) {
        emberManager = new embercli.EmberCliManager();
    }
    if (!installed) {
        installed = emberOps.isEmberCliInstalled();
    }
    if (!cmd) {
        return;
    }
    // Ensure Ember Cli is installed
    if (!installed) {
        return vscode_1.window.showErrorMessage('Ember Cli is not installed');
    }
    ;
    let ecmd = emberManager[cmd];
    if (typeof ecmd === 'function') {
        try {
            ecmd.apply(emberManager, arg);
        }
        catch (e) {
            // Well, clearly we didn't call a function
            console.log(e);
        }
    }
}
//# sourceMappingURL=extension.js.map