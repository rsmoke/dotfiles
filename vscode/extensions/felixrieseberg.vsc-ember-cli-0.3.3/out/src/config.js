"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = require("path");
const fs = require("fs-extra");
const configPath = path.join(vscode_1.workspace.rootPath, ".vscode", "ember.json");
const merge = require("merge");
const pathExists = require("path-exists");
function readSetting(key) {
    let config = getConfig();
    if (config) {
        return config[key];
    }
    else {
        return null;
    }
}
exports.readSetting = readSetting;
function writeSetting(data) {
    let currentConfig, mergedConfig, newConfig;
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
    let config;
    if (!vscode_1.workspace || !vscode_1.workspace.rootPath) {
        return null;
    }
    try {
        config = require(configPath);
        return config;
    }
    catch (err) {
        return null;
    }
}
function getFullAppPath() {
    const appPath = readSetting("appPath") || "./";
    return path.join(vscode_1.workspace.rootPath, appPath);
}
exports.getFullAppPath = getFullAppPath;
function getPathToEmberBin() {
    const appPath = getFullAppPath();
    const localEmber = path.join(appPath, "node_modules/.bin/ember");
    try {
        const stats = fs.statSync(localEmber);
        return stats ? localEmber : "ember";
    }
    catch (error) {
        return "ember";
    }
}
exports.getPathToEmberBin = getPathToEmberBin;
//# sourceMappingURL=config.js.map