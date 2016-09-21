"use strict";
var ember_ops_1 = require("./ember-ops");
var DumbCache = (function () {
    function DumbCache(options) {
        if (options === void 0) { options = { preload: false }; }
        if (options.preload) {
            this.preload();
        }
    }
    DumbCache.prototype.preload = function () {
        return this._preloadGenerateChoices();
    };
    DumbCache.prototype._preloadGenerateChoices = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            ember_ops_1.getHelp("generate").then(function (result) {
                if (result && result.availableBlueprints) {
                    _this.generateChoices = result.availableBlueprints[0]["ember-cli"];
                    resolve();
                }
                else {
                    // Todo: Handle this
                    reject();
                }
            });
        });
    };
    return DumbCache;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DumbCache;
//# sourceMappingURL=dumb-cache.js.map