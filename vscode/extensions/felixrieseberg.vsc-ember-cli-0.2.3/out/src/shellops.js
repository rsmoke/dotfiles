var vscode_1 = require('vscode');
var cp = require('child_process');
var EmberOperation = (function () {
    function EmberOperation(command) {
        var _this = this;
        this._spawn = cp.spawn;
        this._oc = vscode_1.window.createOutputChannel('Ember: Build Project');
        this._process = this._spawn('ember', ['build'], {
            cwd: vscode_1.workspace.rootPath
        });
        this._oc.show();
        this._process.stdout.on('data', function (data) {
            _this._oc.appendLine(data);
        });
        this._process.stderr.on('data', function (data) {
            _this._oc.appendLine(data);
        });
        this._process.on('close', function (code) {
            _this._oc.appendLine('Ember build process exited with code ' + code);
            _this._oc.hide();
        });
    }
    EmberOperation.prototype.dispose = function () {
        if (this._oc)
            this._oc.dispose();
    };
    return EmberOperation;
})();
exports.EmberOperation = EmberOperation;
//# sourceMappingURL=shellops.js.map