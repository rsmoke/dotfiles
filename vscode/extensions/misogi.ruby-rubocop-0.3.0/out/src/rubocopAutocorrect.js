"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rubocop_1 = require('./rubocop');
var RubocopAutocorrect = (function (_super) {
    __extends(RubocopAutocorrect, _super);
    function RubocopAutocorrect() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(RubocopAutocorrect.prototype, "isOnSave", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    RubocopAutocorrect.prototype.commandArguments = function (fileName) {
        return _super.prototype.commandArguments.call(this, fileName).concat(['--auto-correct']);
    };
    return RubocopAutocorrect;
}(rubocop_1.Rubocop));
exports.RubocopAutocorrect = RubocopAutocorrect;
//# sourceMappingURL=rubocopAutocorrect.js.map