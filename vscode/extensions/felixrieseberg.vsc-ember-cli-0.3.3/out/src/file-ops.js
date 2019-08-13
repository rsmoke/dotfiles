"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const fs = require("fs");
const path = require("path");
const constants_1 = require("./constants");
const config_1 = require("./config");
// Generic imports
const pathExists = require("path-exists");
const merge = require("merge");
// Merges or overwrites settings in jsconfig.json
function appendJSConfig(data) {
    if (!vscode_1.workspace || !vscode_1.workspace.rootPath) {
        return false;
    }
    let jscPath = path.join(config_1.getFullAppPath(), "jsconfig.json");
    let newJsc, mergedJsc, currentJsc;
    // Check first if a jsconfig.json exists
    if (pathExists.sync(jscPath)) {
        // Merge
        try {
            currentJsc = JSON.parse(fs.readFileSync(jscPath, "utf8"));
            mergedJsc = merge(currentJsc, data);
        }
        catch (e) {
            console.log(e);
        }
    }
    // Write new config
    try {
        newJsc = mergedJsc || constants_1.jsConfig;
        fs.writeFileSync(jscPath, JSON.stringify(newJsc), "utf8");
    }
    catch (e) {
        return false;
    }
}
exports.appendJSConfig = appendJSConfig;
function hasFile(file) {
    if (!vscode_1.workspace || !vscode_1.workspace.rootPath) {
        return false;
    }
    return pathExists.sync(path.join(config_1.getFullAppPath(), file));
}
exports.hasFile = hasFile;
//# sourceMappingURL=file-ops.js.map