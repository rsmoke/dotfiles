var vscode_1 = require('vscode');
var cp = require('child_process');
var EmberOperation = (function () {
    function EmberOperation(cmd) {
        var _this = this;
        this._spawn = cp.spawn;
        if (!vscode_1.workspace || !vscode_1.workspace.rootPath)
            return false;
        this._oc = vscode_1.window.createOutputChannel("Ember: " + capitalizeFirstLetter(cmd) + " Project");
        this._process = this._spawn('ember', [cmd], {
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
            _this._oc.appendLine("Ember " + cmd + " process exited with code " + code);
            _this._oc.hide();
        });
        return this;
    }
    EmberOperation.prototype.dispose = function () {
        if (this._oc)
            this._oc.dispose();
    };
    return EmberOperation;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmberOperation;
// Helper
function capitalizeFirstLetter(input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
}
//# sourceMappingURL=ember-op.js.map