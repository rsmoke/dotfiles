var vscode_1 = require('vscode');
var fs = require('fs');
var path = require('path');
var constants = require('./constants');
// Generic imports
var pathExists = require('path-exists');
// Set the project up
function setupProject() {
    if (!vscode_1.workspace || !vscode_1.workspace.rootPath)
        return false;
    appendVSCIgnore(constants.ignoreItems);
}
exports.setupProject = setupProject;
// Is the current project setup for Visual Studio Code?
function isProjectSetup() {
    return false;
}
exports.isProjectSetup = isProjectSetup;
// Is the current project an Ember Cli project?
function isProjectEmberCli() {
    return true;
}
exports.isProjectEmberCli = isProjectEmberCli;
/*
// Helper Functions
*/
// Append .vscodeignore
function appendVSCIgnore(ignoreItems) {
    if (!ignoreItems || ignoreItems.length === 0)
        return false;
    var vsciPath = path.join(vscode_1.workspace.rootPath, '.vscodeignore');
    var eol = require('os').EOL || (process.platform === 'win32' ? '\r\n' : '\n');
    // Let's first see if the file already exists - and if so,
    // which items we have to fill in
    if (pathExists.sync(vsciPath)) {
        var vsciBuffer = fs.readFileSync(vsciPath);
        var vsciContent = vsciBuffer.toString().split(/\r?\n/);
        // If there's anything in that file, we'll need to add a newline
        if (vsciContent.length > 0) {
            ignoreItems.unshift('');
        }
        // Compare items to ignore and the current .vscodeignore items
        for (var i = 0; i < vsciContent.length; i++) {
            for (var ii = 0; ii < ignoreItems.length; ii++) {
                if (vsciContent[i] === ignoreItems[ii]) {
                    ignoreItems.splice(ii, 1);
                }
            }
        }
    }
    // Now, let's append the .vscodeignore
    var ignoreContent = ignoreItems.join(eol);
    try {
        fs.appendFileSync(vsciPath, ignoreContent, 'utf8');
        return true;
    }
    catch (e) {
        return false;
    }
}
//# sourceMappingURL=ember-cli.js.map