var vscode_1 = require('vscode');
var fs = require('fs');
var path = require('path');
var constants = require('./constants');
// Generic imports
var pathExists = require('path-exists');
var merge = require('merge');
// Merges or overwrites settings in jsconfig.json
function appendJSConfig(data) {
    if (!vscode_1.workspace || !vscode_1.workspace.rootPath)
        return false;
    var jscPath = path.join(vscode_1.workspace.rootPath, 'jsconfig.json');
    var newJsc;
    var mergedJsc;
    var currentJsc;
    // Check first if a jsconfig.json exists	
    if (pathExists.sync(jscPath)) {
        // Merge
        try {
            currentJsc = JSON.parse(fs.readFileSync(jscPath, 'utf8'));
            mergedJsc = merge(currentJsc, data);
        }
        catch (e) {
            console.log(e);
        }
    }
    // Write new config
    try {
        newJsc = mergedJsc || constants.jsConfig;
        fs.writeFileSync(jscPath, JSON.stringify(newJsc), 'utf8');
    }
    catch (e) {
        return false;
    }
}
exports.appendJSConfig = appendJSConfig;
// Appends the current project's .vscodeignore file with additional items
function appendVSCIgnore(ignoreItems) {
    if (!ignoreItems || ignoreItems.length === 0 || !vscode_1.workspace || !vscode_1.workspace.rootPath)
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
exports.appendVSCIgnore = appendVSCIgnore;
//# sourceMappingURL=fileops.js.map