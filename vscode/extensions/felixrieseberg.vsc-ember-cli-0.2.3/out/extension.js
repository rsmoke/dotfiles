"use strict";
var vscode_1 = require('vscode');
var embercli = require('./src/ember-cli');
var emberOps = require('./src/ember-ops');
var emberManager;
var installed = false;
function activate() {
    execute('setupProject');
    // Register Commands
    vscode_1.commands.registerCommand('extension.addon', function () { return execute('addon'); });
    vscode_1.commands.registerCommand('extension.setupProject', function () { return execute('setupProject'); });
    vscode_1.commands.registerCommand('extension.build', function () { return execute('build'); });
    vscode_1.commands.registerCommand('extension.serve', function () { return execute('serve'); });
    vscode_1.commands.registerCommand('extension.init', function () { return execute('init'); });
    vscode_1.commands.registerCommand('extension.new', function () { return execute('new'); });
    vscode_1.commands.registerCommand('extension.install', function () { return execute('install'); });
    vscode_1.commands.registerCommand('extension.generate', function () { return execute('blueprint', ['generate']); });
    vscode_1.commands.registerCommand('extension.destroy', function () { return execute('blueprint', ['destroy']); });
    vscode_1.commands.registerCommand('extension.version', function () { return execute('version'); });
    vscode_1.commands.registerCommand('extension.test', function () { return execute('test'); });
    vscode_1.commands.registerCommand('extension.testServer', function () { return execute('testServer'); });
    vscode_1.commands.registerCommand('extension.installTypings', function () { return execute('installTypings'); });
}
exports.activate = activate;
function execute(cmd, arg) {
    if (!emberManager)
        emberManager = new embercli.EmberCliManager();
    if (!installed)
        installed = emberOps.isEmberCliInstalled();
    if (!cmd)
        return;
    // Ensure Ember Cli is installed 
    if (!installed) {
        return vscode_1.window.showErrorMessage('Ember Cli is not installed');
    }
    ;
    var ecmd = emberManager[cmd];
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