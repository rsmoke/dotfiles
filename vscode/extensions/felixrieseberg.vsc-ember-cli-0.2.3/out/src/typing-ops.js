"use strict";
var ember_ops_1 = require("./ember-ops");
var file_ops_1 = require("./file-ops");
var config_1 = require("./config");
var vscode_1 = require("vscode");
var path = require("path");
var fs = require("fs-extra");
var pathExists = require("path-exists");
function installTypings() {
    return new Promise(function (resolve, reject) {
        if (!shouldInstallTypings())
            return resolve();
        return ember_ops_1.getEmberVersion()
            .then(function (version) { return installTypingsForVersion(version); });
    });
}
exports.installTypings = installTypings;
function installTypingsForVersion(version) {
    return new Promise(function (resolve, reject) {
        var typingsFolder = path.join(vscode_1.workspace.rootPath, "typings", "ember");
        var versionTypings = path.join(__dirname, "..", "..", "resources", "typings", "v" + version, "ember.d.ts");
        var lastTypings = path.join(__dirname, "..", "..", "resources", "typings", "v2.4.4", "ember.d.ts");
        var typings;
        // Ensure we have typings for that version - otherwise, try the last one we have
        pathExists(versionTypings).then(function (exists) {
            typings = (exists) ? versionTypings : lastTypings;
            // Ensure the target folder exists
            fs.ensureDir(typingsFolder, function (err) {
                if (err)
                    return reject();
                // Then, copy it over
                fs.copy(typings, path.join(typingsFolder, "ember.d.ts"), function (err) {
                    if (err)
                        return reject();
                    resolve();
                });
            });
        });
    });
}
function shouldInstallTypings() {
    var setting = config_1.readSetting("installTypings");
    var hasTypings = hasEmberTypings();
    var path = vscode_1.workspace.rootPath;
    if (!vscode_1.workspace || !vscode_1.workspace.rootPath || setting === false || hasTypings) {
        return false;
    }
    return true;
}
function hasEmberTypings() {
    return file_ops_1.hasFile(path.join(vscode_1.workspace.rootPath, "typings", "ember", "ember.d.ts"));
}
//# sourceMappingURL=typing-ops.js.map