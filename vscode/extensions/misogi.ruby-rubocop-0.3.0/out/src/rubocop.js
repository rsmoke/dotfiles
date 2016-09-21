"use strict";
var vscode = require('vscode');
var cp = require('child_process');
var path = require('path');
var fs = require('fs');
var Rubocop = (function () {
    function Rubocop(diagnostics) {
        this.diag = diagnostics;
        this.command = (process.platform === 'win32') ? 'rubocop.bat' : 'rubocop';
        this.resetConfig();
    }
    Rubocop.prototype.execute = function (document) {
        var _this = this;
        if (document.languageId !== 'ruby') {
            return;
        }
        this.resetConfig();
        if (!this.path || 0 === this.path.length) {
            vscode.window.showWarningMessage('execute path is empty! please check ruby.rubocop.executePath config');
            return;
        }
        var fileName = document.fileName;
        var currentPath = vscode.workspace.rootPath;
        if (!currentPath) {
            currentPath = path.dirname(fileName);
        }
        var executeFile = this.path + this.command;
        var onDidExec = function (error, stdout, stderr) {
            if (error && error.code === 'ENOENT') {
                vscode.window.showWarningMessage(executeFile + " is not executable");
                return;
            }
            else if (error && error.code === 127) {
                var errorMessage = stderr.toString();
                vscode.window.showWarningMessage(errorMessage);
                console.log(error.message);
                return;
            }
            _this.diag.clear();
            var output = stdout.toString();
            var rubocop;
            try {
                rubocop = JSON.parse(output);
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    var regex = /[\r\n \t]/g;
                    var message = output.replace(regex, ' ');
                    var errorMessage = "Error on parsing output (It might non-JSON output) : \"" + message + "\"";
                    vscode.window.showWarningMessage(errorMessage);
                    return;
                }
            }
            if (rubocop === undefined) {
                var errorMessage = stderr.toString();
                vscode.window.showWarningMessage(errorMessage);
                return;
            }
            var entries = [];
            rubocop.files.forEach(function (file) {
                var diagnostics = [];
                var url = vscode.Uri.file(fileName);
                file.offenses.forEach(function (offence) {
                    var loc = offence.location;
                    var range = new vscode.Range(loc.line - 1, loc.column - 1, loc.line - 1, loc.length + loc.column - 1);
                    var sev = _this.severity(offence.severity);
                    var message = offence.message + " (" + offence.severity + ":" + offence.cop_name + ")";
                    var diagnostic = new vscode.Diagnostic(range, message, sev);
                    diagnostics.push(diagnostic);
                });
                entries.push([url, diagnostics]);
            });
            _this.diag.set(entries);
        };
        var args = this.commandArguments(fileName);
        cp.execFile(executeFile, args, { cwd: currentPath }, onDidExec);
    };
    Object.defineProperty(Rubocop.prototype, "isOnSave", {
        get: function () {
            return this.onSave;
        },
        enumerable: true,
        configurable: true
    });
    // extract argument to an array
    Rubocop.prototype.commandArguments = function (fileName) {
        var commandArguments = [fileName, '--format', 'json'];
        if (this.configPath !== '') {
            if (fs.existsSync(this.configPath)) {
                var config = ['--config', this.configPath];
                commandArguments = commandArguments.concat(config);
            }
            else {
                vscode.window.showWarningMessage(this.configPath + " file does not exist. Ignoring...");
            }
        }
        return commandArguments;
    };
    Rubocop.prototype.resetConfig = function () {
        var conf = vscode.workspace.getConfiguration('ruby.rubocop');
        this.path = conf.get('executePath', '');
        // try to autodetect the path (if it's not specified explicitly)
        if (!this.path || 0 === this.path.length) {
            this.path = this.autodetectExecutePath();
        }
        this.configPath = conf.get('configFilePath', '');
        this.onSave = conf.get('onSave', true);
    };
    Rubocop.prototype.severity = function (sev) {
        switch (sev) {
            case 'refactor': return vscode.DiagnosticSeverity.Hint;
            case 'convention': return vscode.DiagnosticSeverity.Information;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'fatal': return vscode.DiagnosticSeverity.Error;
            default: return vscode.DiagnosticSeverity.Error;
        }
    };
    Rubocop.prototype.autodetectExecutePath = function () {
        var key = 'PATH';
        var paths = process.env[key];
        if (!paths) {
            return '';
        }
        var pathparts = paths.split(path.delimiter);
        for (var i = 0; i < pathparts.length; i++) {
            var binpath = path.join(pathparts[i], this.command);
            if (fs.existsSync(binpath)) {
                return pathparts[i] + path.sep;
            }
        }
        return '';
    };
    return Rubocop;
}());
exports.Rubocop = Rubocop;
//# sourceMappingURL=rubocop.js.map