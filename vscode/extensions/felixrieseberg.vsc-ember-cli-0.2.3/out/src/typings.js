"use strict";
var vscode_1 = require("vscode");
var ember_ops_1 = require("./ember-ops");
var file_ops_1 = require("./file-ops");
function appendTypings() {
    // Check that the workspace exists
    if (!vscode_1.workspace || !vscode_1.workspace.rootPath) {
        return false;
    }
    var version = ember_ops_1.getEmberVersion();
}
exports.appendTypings = appendTypings;
function hasEmberTypings() {
    return file_ops_1.hasFile("/typings/ember/ember.d.ts");
}
exports.hasEmberTypings = hasEmberTypings;
//# sourceMappingURL=typings.js.map