"use strict";
var vscode_1 = require("vscode");
var constants_1 = require("./constants");
var file_ops_1 = require("./file-ops");
var typing_ops_1 = require("./typing-ops");
var ember_ops_1 = require("./ember-ops");
var helpers_1 = require("./helpers");
var dumb_cache_1 = require("./dumb-cache");
var EmberCliManager = (function () {
    function EmberCliManager() {
        this._cache = new dumb_cache_1.default({ preload: true });
    }
    /**
     * All the methods below map 1:1 to an ember-cli operation
     * Each command should just invoke the ember cli command,
     * except in cases where we want the user to enter more input,
     * or when we want to "massage" the command.
     */
    // ember addon
    EmberCliManager.prototype.addon = function () {
        var addonOps = new ember_ops_1.EmberOperation("addon", {
            isOutputChannelVisible: false
        });
        addonOps
            .run()
            .then(function (result) {
            if (result && result.code === 0) {
                vscode_1.window.showInformationMessage("Addon folder structure created!");
            }
            else {
                vscode_1.window.showErrorMessage("Addon folder structure creation failed.");
            }
        });
    };
    // ember version
    EmberCliManager.prototype.version = function () {
        var versionOps = new ember_ops_1.EmberOperation("version", {
            isOutputChannelVisible: false
        });
        versionOps
            .run()
            .then(function (result) {
            if (result.code === 0) {
                vscode_1.window.showInformationMessage("Ember Cli " + result.stdout);
            }
        });
    };
    // ember install
    EmberCliManager.prototype.install = function () {
        vscode_1.window.showInputBox({
            prompt: "Name of the addon to install?"
        }).then(function (result) {
            if (!result || result === "") {
                return;
            }
            ;
            var installOp = new ember_ops_1.EmberOperation(["install", result]);
            installOp.run();
        });
    };
    // ember new
    EmberCliManager.prototype.new = function () {
        var _this = this;
        vscode_1.window.showInputBox({
            prompt: "Name of the new application?"
        }).then(function (result) {
            if (!result || result === "") {
                return;
            }
            ;
            var newOp = new ember_ops_1.EmberOperation(["new", result]);
            newOp.run();
            _this.setupProject();
        });
    };
    // ember init
    EmberCliManager.prototype.init = function () {
        var initOp = new ember_ops_1.EmberOperation(["init"]);
        initOp.run();
        this.setupProject();
    };
    // ember build
    EmberCliManager.prototype.build = function () {
        var quickPickItems = [
            {
                label: "development",
                description: "Build with env=development"
            },
            {
                label: "production",
                description: "Build with env=production"
            }
        ];
        vscode_1.window.showQuickPick(quickPickItems).then(function (result) {
            if (!result) {
                return;
            }
            ;
            var envarg = (result.label === "development") ? "-dev" : "-prod";
            var buildOp = new ember_ops_1.EmberOperation(["build", envarg]);
            buildOp.run().then(function (result) {
                if (result.code === 0) {
                    vscode_1.window.showInformationMessage("Project successfully built!");
                }
            });
        });
    };
    // ember serve
    EmberCliManager.prototype.serve = function () {
        var _this = this;
        if (this._cache.serveOperation) {
            var quickPickItems = [
                {
                    label: "Show Output",
                    description: "Display the Ember Serve Task Output"
                },
                {
                    label: "Restart",
                    description: "Restart the serve process"
                },
                {
                    label: "Stop",
                    description: "Kill the serve process"
                }
            ];
            vscode_1.window.showQuickPick(quickPickItems).then(function (result) {
                if (result.label === "Show Output") {
                    _this._cache.serveOperation.showOutputChannel();
                }
                else if (result.label === "Stop") {
                    _this._cache.serveOperation.kill();
                    _this._cache.serveOperation.dispose();
                    _this._cache.serveOperation = null;
                }
                else {
                    _this._cache.serveOperation.kill();
                    _this._cache.serveOperation.dispose();
                    _this._cache.serveOperation = new ember_ops_1.EmberOperation("serve");
                    _this._cache.serveOperation.run();
                }
            });
        }
        else {
            this._cache.serveOperation = new ember_ops_1.EmberOperation("serve");
            this._cache.serveOperation.run();
        }
    };
    // ember generate & ember destroy
    EmberCliManager.prototype.blueprint = function (type) {
        var _this = this;
        if (!this._cache.generateChoices) {
            return this._cache.preload().then(function () { return _this.blueprint(type); });
        }
        if (type !== "generate" && type !== "destroy") {
            return;
        }
        ;
        var qpChoices = this._cache.generateChoices.map(function (element) {
            return {
                label: element.name,
                description: element.description,
                anonymousOptions: element.anonymousOptions,
                availableOptions: element.availableOptions
            };
        });
        vscode_1.window.showQuickPick(qpChoices, {
            placeHolder: "Which blueprint do you want to " + type + "?",
            matchOnDescription: true
        }).then(function (result) {
            if (!result) {
                return;
            }
            ;
            var optionPromises = [];
            var optionResults = [];
            var gdName;
            var i = 0;
            if (result.anonymousOptions && result.anonymousOptions.length > 0) {
                for (i = 0; i < result.anonymousOptions.length; i++) {
                    var name = result.anonymousOptions[i];
                    optionPromises.push(vscode_1.window.showInputBox({
                        prompt: helpers_1.capitalizeFirstLetter(name) + "?"
                    }).then(function (promptResult) {
                        optionResults.push(promptResult);
                        gdName = (i === 1) ? promptResult : gdName;
                    }));
                }
            }
            Promise.all(optionPromises).then(function (results) {
                var generateArgs = optionResults.join(" ");
                var blueprintOp = new ember_ops_1.EmberOperation([type, result.label, generateArgs], {
                    isOutputChannelVisible: false
                });
                blueprintOp.run().then(function (result) {
                    if (result.code === 0) {
                        var message = gdName + " sucessfully " + ((type === "generate") ? "generated" : "destroyed") + "!";
                        vscode_1.window.showInformationMessage(message);
                    }
                });
            });
        });
    };
    // ember test
    EmberCliManager.prototype.test = function () {
        var testOp = new ember_ops_1.EmberOperation(["test"]);
        testOp.run().then(function (result) {
            if (result && result.code === 0) {
                vscode_1.window.showInformationMessage("Tests passed with code " + result.code);
            }
            else {
                vscode_1.window.showErrorMessage("Tests failed with error code " + result.code);
            }
        });
    };
    // ember test (server)
    EmberCliManager.prototype.testServer = function () {
        var _this = this;
        if (this._cache.testServeOperation) {
            var quickPickItems = [
                {
                    label: "Restart",
                    description: "Restart the serve process"
                },
                {
                    label: "Stop",
                    description: "Kill the serve process"
                }
            ];
            vscode_1.window.showQuickPick(quickPickItems).then(function (result) {
                if (result.label === "Stop") {
                    _this._cache.testServeOperation.kill();
                    _this._cache.testServeOperation.dispose();
                    _this._cache.testServeOperation = null;
                    vscode_1.window.showInformationMessage("Ember Cli: Test Server stopped");
                }
                else {
                    _this._cache.testServeOperation.kill();
                    _this._cache.testServeOperation.dispose();
                    _this._cache.testServeOperation = new ember_ops_1.EmberOperation(["test", "--server"], {
                        isOutputChannelVisible: false
                    });
                    _this._cache.testServeOperation.run();
                    vscode_1.window.showInformationMessage("Ember Cli: Test Server is running");
                }
            });
        }
        else {
            this._cache.testServeOperation = new ember_ops_1.EmberOperation(["test", "--server"], {
                isOutputChannelVisible: false
            });
            this._cache.testServeOperation.run();
            vscode_1.window.showInformationMessage("Ember Cli: Test Server is running");
        }
    };
    // Install Ember Typings
    EmberCliManager.prototype.installTypings = function () {
        return typing_ops_1.installTypings();
    };
    /*
    // Helper Functions
    */
    // Is the current project setup for Visual Studio Code?
    EmberCliManager.prototype.isProjectSetup = function () {
        return false;
    };
    // Is the current project an Ember Cli project?
    EmberCliManager.prototype.isProjectEmberCli = function () {
        return true;
    };
    // Set the project up
    EmberCliManager.prototype.setupProject = function () {
        if (!vscode_1.workspace || !vscode_1.workspace.rootPath) {
            return false;
        }
        file_ops_1.appendVSCIgnore(constants_1.ignoreItems);
        file_ops_1.appendJSConfig(constants_1.jsConfig);
        typing_ops_1.installTypings();
    };
    return EmberCliManager;
}());
exports.EmberCliManager = EmberCliManager;
//# sourceMappingURL=ember-cli.js.map