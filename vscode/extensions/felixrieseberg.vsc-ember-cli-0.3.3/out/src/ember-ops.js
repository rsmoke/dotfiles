"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const cp = require("child_process");
const os = require("os");
const path = require("path");
const helpers_1 = require("./helpers");
const config_1 = require("./config");
class EmberOperation {
    constructor(cmd, options = { isOutputChannelVisible: true }) {
        this._spawn = cp.spawn;
        this._stdout = [];
        this._stderr = [];
        this._isOutputChannelVisible = options.isOutputChannelVisible;
        this.cmd = (Array.isArray(cmd)) ? cmd : [cmd];
        this.created = true;
    }
    getStdout() {
        return this._stdout;
    }
    getStderr() {
        return this._stderr;
    }
    showOutputChannel() {
        if (this._oc) {
            this._oc.show();
            this._isOutputChannelVisible = true;
        }
    }
    hideOutputChannel() {
        if (this._oc) {
            this._oc.dispose();
            this._oc.hide();
            this._isOutputChannelVisible = false;
        }
    }
    kill() {
        if (this._process) {
            this._process.kill();
        }
    }
    run() {
        return new Promise((resolve, reject) => {
            if (!vscode_1.workspace || !vscode_1.workspace.rootPath) {
                return reject();
            }
            let lastOut = "";
            let debugEnabled = process.env.VSC_EMBER_CLI_DEBUG || process.env["VSC EMBER CLI DEBUG"];
            let emberPath = config_1.getPathToEmberBin();
            this._oc = vscode_1.window.createOutputChannel(`Ember: ${helpers_1.capitalizeFirstLetter(this.cmd[0])}`);
            // On Windows, we'll have to call Ember with PowerShell
            // https://github.com/nodejs/node-v0.x-archive/issues/2318
            if (os.platform() === "win32") {
                let joinedArgs = this.cmd;
                joinedArgs.unshift(emberPath);
                this._process = this._spawn("powershell.exe", joinedArgs, {
                    cwd: config_1.getFullAppPath(),
                    stdio: ["ignore", "pipe", "pipe"]
                });
            }
            else {
                this._process = this._spawn(emberPath, this.cmd, {
                    cwd: config_1.getFullAppPath()
                });
            }
            this._oc.appendLine("Building...");
            if (this._isOutputChannelVisible || debugEnabled) {
                this._isOutputChannelVisible = true;
                this._oc.show();
            }
            this._process.stdout.on("data", (data) => {
                let out = data.toString();
                if (lastOut && out && (lastOut + "." === out)
                    || (lastOut.slice(0, lastOut.length - 1)) === out
                    || (lastOut.slice(0, lastOut.length - 2)) === out
                    || (lastOut.slice(0, lastOut.length - 3)) === out) {
                    lastOut = out;
                    return this._oc.append(".");
                }
                this._oc.appendLine(out);
                this._stdout.push(out);
                lastOut = out;
            });
            this._process.stderr.on("data", (data) => {
                let out = data.toString();
                this._oc.appendLine(out);
                this._stderr.push(out);
            });
            this._process.on("close", (code) => {
                this._oc.appendLine(`Ember ${this.cmd[0]} process exited with code ${code}`);
                resolve({
                    code: code,
                    stderr: this._stderr,
                    stdout: this._stdout
                });
            });
        });
    }
    dispose() {
        if (this._oc) {
            this._oc.dispose();
        }
        if (this._process) {
            this._process.kill();
        }
    }
}
exports.EmberOperation = EmberOperation;
function isEmberCliInstalled() {
    let emberBin = config_1.getPathToEmberBin();
    try {
        let exec = cp.execSync(`${emberBin} -v`, {
            cwd: config_1.getFullAppPath()
        });
        console.log("Ember is apparently installed");
        console.log(exec.toString());
        return true;
    }
    catch (e) {
        debugger;
        return false;
    }
}
exports.isEmberCliInstalled = isEmberCliInstalled;
function getEmberVersion() {
    return new Promise((resolve, reject) => {
        let bower;
        if (!vscode_1.workspace || !vscode_1.workspace.rootPath) {
            return reject(new Error("Could not determine Ember version: Workspace not available."));
        }
        // Try go require the bower.json
        try {
            bower = require(path.join(config_1.getFullAppPath(), "bower.json"));
        }
        catch (error) {
            return reject(new Error("Could not determine Ember version: Bower.json not found."));
        }
        // Attempt to get to the ember version
        if (bower && bower.dependencies && bower.dependencies.ember) {
            let version = helpers_1.semver().exec(bower.dependencies.ember);
            if (version && version[0]) {
                resolve(version[0]);
            }
            else {
                return reject(new Error("Could not determine Ember version: Ember version not recognized."));
            }
        }
        else {
            return reject(new Error("Could not determine Ember version: Ember not a bower dependency."));
        }
    });
}
exports.getEmberVersion = getEmberVersion;
function getHelp(cmd) {
    return new Promise((resolve, reject) => {
        try {
            let exec = cp.execSync(`ember --help --json`);
            let execOutput = exec.toString();
            let result = parseHelp(cmd, execOutput);
            resolve(result);
        }
        catch (e) {
            if (cmd === "generate") {
                // For generate, let"s use our fallback
                let generateFallback = require("../../resources/json/generate.json");
                return resolve(generateFallback);
            }
            reject(e);
        }
    });
}
exports.getHelp = getHelp;
function parseHelp(cmd, output) {
    if (!output || !cmd) {
        return null;
    }
    // Clean input
    let jsonIndex = output.indexOf("{");
    let cleanedOutput = (jsonIndex > 0) ? output.slice(jsonIndex) : output;
    let help = JSON.parse(cleanedOutput);
    let cmdHelp = null;
    if (help && help.commands) {
        cmdHelp = help.commands.find((item) => {
            return (item && item.name && item.name === cmd);
        });
    }
    return cmdHelp;
}
//# sourceMappingURL=ember-ops.js.map