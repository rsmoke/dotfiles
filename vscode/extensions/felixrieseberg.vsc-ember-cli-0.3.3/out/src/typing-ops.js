"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ember_ops_1 = require("./ember-ops");
const file_ops_1 = require("./file-ops");
const config_1 = require("./config");
const vscode_1 = require("vscode");
const path = require("path");
const fs = require("fs-extra");
const pathExists = require("path-exists");
function installTypings() {
    return new Promise((resolve, reject) => {
        if (!shouldInstallTypings()) {
            return resolve();
        }
        return ember_ops_1.getEmberVersion()
            .then((version) => installTypingsForVersion(version));
    });
}
exports.installTypings = installTypings;
function installTypingsForVersion(version) {
    return new Promise((resolve, reject) => {
        let typingsFolder = path.join(vscode_1.workspace.rootPath, "typings", "ember");
        let versionTypings = path.join(__dirname, "..", "..", "resources", "typings", `v${version}`, "ember.d.ts");
        let lastTypings = path.join(__dirname, "..", "..", "resources", "typings", "v2.4.4", "ember.d.ts");
        let typings;
        // Ensure we have typings for that version - otherwise, try the last one we have
        pathExists(versionTypings).then((exists) => {
            typings = (exists) ? versionTypings : lastTypings;
            // Ensure the target folder exists
            fs.ensureDir(typingsFolder, (err) => {
                if (err) {
                    return reject();
                }
                // Then, copy it over
                fs.copy(typings, path.join(typingsFolder, "ember.d.ts"), (err) => {
                    if (err) {
                        return reject();
                    }
                    resolve();
                });
            });
        });
    });
}
function shouldInstallTypings() {
    let setting = config_1.readSetting("installTypings");
    let hasTypings = hasEmberTypings();
    if (!vscode_1.workspace || !vscode_1.workspace.rootPath || setting === false || hasTypings) {
        return false;
    }
    return true;
}
function hasEmberTypings() {
    return file_ops_1.hasFile(path.join(vscode_1.workspace.rootPath, "typings", "ember", "ember.d.ts"));
}
//# sourceMappingURL=typing-ops.js.map