"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StateHandler {
    constructor(context) {
        this.context = context;
    }
    set(key, value) {
        this.context[key] = value;
    }
    get(key) {
        return (this.context[key]);
    }
}
exports.default = StateHandler;
//# sourceMappingURL=state_handler.js.map