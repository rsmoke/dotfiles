"use strict";
var vscode_1 = require("vscode");
var path = require("path");
var fs = require("fs-extra");
var configPath = path.join(vscode_1.workspace.rootPath, ".vscode", "ember.json");
var merge = require("merge");
var pathExists = require("path-exists");
function readSetting(key) {
    var config = getConfig();
    if (config) {
        return config[key];
    }
    else {
        return null;
    }
}
exports.readSetting = readSetting;
function writeSetting(data) {
    var currentConfig, mergedConfig, newConfig;
    // Check first if a jsconfig.json exists
    if (pathExists.sync(configPath)) {
        // Merge
        try {
            currentConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
            mergedConfig = merge(currentConfig, data);
        }
        catch (e) {
            console.log(e);
        }
    }
    // Write new config
    try {
        newConfig = mergedConfig || data;
        fs.writeFileSync(configPath, JSON.stringify(newConfig), "utf8");
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.writeSetting = writeSetting;
function getConfig() {
    var config;
    if (!vscode_1.workspace || !vscode_1.workspace.rootPath)
        return null;
    try {
        config = require(configPath);
        return config;
    }
    catch (err) {
        return null;
    }
}
function createConfig() {
    if (!vscode_1.workspace || !vscode_1.workspace.rootPath)
        return null;
    try {
        fs.ensureFileSync(configPath);
        return true;
    }
    catch (err) {
        return false;
    }
}
//# sourceMappingURL=config.js.map