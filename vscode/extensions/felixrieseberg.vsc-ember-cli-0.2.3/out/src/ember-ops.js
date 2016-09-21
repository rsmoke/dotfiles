"use strict";
var vscode_1 = require("vscode");
var cp = require("child_process");
var os = require("os");
var path = require("path");
var helpers_1 = require("./helpers");
var EmberOperation = (function () {
    function EmberOperation(cmd, options) {
        if (options === void 0) { options = { isOutputChannelVisible: true }; }
        this._spawn = cp.spawn;
        this._stdout = [];
        this._stderr = [];
        this._isOutputChannelVisible = options.isOutputChannelVisible;
        this.cmd = (Array.isArray(cmd)) ? cmd : [cmd];
        this.created = true;
    }
    EmberOperation.prototype.getStdout = function () {
        return this._stdout;
    };
    EmberOperation.prototype.getStderr = function () {
        return this._stderr;
    };
    EmberOperation.prototype.showOutputChannel = function () {
        if (this._oc) {
            this._oc.show();
            this._isOutputChannelVisible = true;
        }
    };
    EmberOperation.prototype.hideOutputChannel = function () {
        if (this._oc) {
            this._oc.dispose();
            this._oc.hide();
            this._isOutputChannelVisible = false;
        }
    };
    EmberOperation.prototype.kill = function () {
        if (this._process) {
            this._process.kill();
        }
    };
    EmberOperation.prototype.run = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!vscode_1.workspace || !vscode_1.workspace.rootPath) {
                return reject();
            }
            var lastOut = "";
            var debugEnabled = process.env.VSC_EMBER_CLI_DEBUG || process.env["VSC EMBER CLI DEBUG"];
            _this._oc = vscode_1.window.createOutputChannel("Ember: " + helpers_1.capitalizeFirstLetter(_this.cmd[0]));
            // On Windows, we'll have to call Ember with PowerShell
            // https://github.com/nodejs/node-v0.x-archive/issues/2318
            if (os.platform() === "win32") {
                var joinedArgs = _this.cmd;
                joinedArgs.unshift("ember");
                _this._process = _this._spawn("powershell.exe", joinedArgs, {
                    cwd: vscode_1.workspace.rootPath
                });
            }
            else {
                _this._process = _this._spawn("ember", _this.cmd, {
                    cwd: vscode_1.workspace.rootPath
                });
            }
            if (_this._isOutputChannelVisible || debugEnabled) {
                _this._isOutputChannelVisible = true;
                _this._oc.show();
            }
            _this._process.stdout.on("data", function (data) {
                var out = data.toString();
                if (lastOut && out && (lastOut + "." === out)
                    || (lastOut.slice(0, lastOut.length - 1)) === out
                    || (lastOut.slice(0, lastOut.length - 2)) === out
                    || (lastOut.slice(0, lastOut.length - 3)) === out) {
                    lastOut = out;
                    return _this._oc.append(".");
                }
                _this._oc.appendLine(data);
                _this._stdout.push(data);
                lastOut = out;
            });
            _this._process.stderr.on("data", function (data) {
                _this._oc.appendLine(data);
                _this._stderr.push(data);
            });
            _this._process.on("close", function (code) {
                _this._oc.appendLine("Ember " + _this.cmd[0] + " process exited with code " + code);
                if (_this._isOutputChannelVisible) {
                    _this._oc.hide();
                }
                resolve({
                    code: parseInt(code),
                    stderr: _this._stderr,
                    stdout: _this._stdout
                });
            });
        });
    };
    EmberOperation.prototype.dispose = function () {
        if (this._oc) {
            this._oc.dispose();
        }
        if (this._process) {
            this._process.kill();
        }
    };
    return EmberOperation;
}());
exports.EmberOperation = EmberOperation;
function isEmberCliInstalled() {
    try {
        var exec = cp.execSync("ember -v");
        console.log("Ember is apparently installed");
        console.log(exec.toString());
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isEmberCliInstalled = isEmberCliInstalled;
function getEmberVersion() {
    return new Promise(function (resolve, reject) {
        var bower;
        if (!vscode_1.workspace || !vscode_1.workspace.rootPath) {
            return reject(new Error("Could not determine Ember version: Workspace not available."));
        }
        // Try go require the bower.json
        try {
            bower = require(path.join(vscode_1.workspace.rootPath, "bower.json"));
        }
        catch (error) {
            return reject(new Error("Could not determine Ember version: Bower.json not found."));
        }
        // Attempt to get to the ember version
        if (bower && bower.dependencies && bower.dependencies.ember) {
            var version = helpers_1.semver().exec(bower.dependencies.ember);
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
    return new Promise(function (resolve, reject) {
        try {
            var exec = cp.execSync("ember --help --json");
            var execOutput = exec.toString();
            var result = parseHelp(cmd, execOutput);
            resolve(result);
        }
        catch (e) {
            if (cmd === "generate") {
                // For generate, let"s use our fallback
                var generateFallback = require("../../resources/json/generate.json");
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
    var jsonIndex = output.indexOf("{");
    var cleanedOutput = (jsonIndex > 0) ? output.slice(jsonIndex) : output;
    var help = JSON.parse(cleanedOutput);
    var cmdHelp = null;
    if (help && help.commands) {
        cmdHelp = help.commands.find(function (item) {
            return (item && item.name && item.name === cmd);
        });
    }
    return cmdHelp;
}
//# sourceMappingURL=ember-ops.js.map