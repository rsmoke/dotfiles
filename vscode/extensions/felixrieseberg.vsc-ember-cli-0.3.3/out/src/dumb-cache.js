"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ember_ops_1 = require("./ember-ops");
class DumbCache {
    preload() {
        return this._preloadGenerateChoices();
    }
    constructor(options = { preload: false }) {
        if (options.preload) {
            this.preload();
        }
    }
    _preloadGenerateChoices() {
        return new Promise((resolve, reject) => {
            ember_ops_1.getHelp("generate").then((result) => {
                if (result && result.availableBlueprints) {
                    this.generateChoices = result.availableBlueprints.reduce((allChoices, currentChoices) => {
                        const newOptions = [];
                        Object.keys(currentChoices).forEach((choiceSource) => {
                            newOptions.push(...currentChoices[choiceSource]);
                        });
                        return [...allChoices, ...newOptions];
                    }, []);
                    resolve();
                }
                else {
                    // Todo: Handle this
                    reject();
                }
            });
        });
    }
}
exports.default = DumbCache;
//# sourceMappingURL=dumb-cache.js.map