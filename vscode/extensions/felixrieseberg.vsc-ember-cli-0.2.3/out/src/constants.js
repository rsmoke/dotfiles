"use strict";
exports.ignoreItems = [
    // compiled output
    "dist/**",
    "tmp/**",
    "build/**",
    "cache/**",
    // dependencies
    "node_modules/**",
    "bower_components/**",
    // misc
    ".sass-cache/**",
    "connect.lock/**",
    "coverage/*/**",
    "libpeerconnection.log"
];
exports.jsConfig = {
    "compilerOptions": {
        "target": "es6",
        "experimentalDecorators": true
    },
    "exclude": [
        "node_modules",
        "bower_components",
        "tmp",
        "vendor",
        ".git",
        "dist"
    ]
};
//# sourceMappingURL=constants.js.map