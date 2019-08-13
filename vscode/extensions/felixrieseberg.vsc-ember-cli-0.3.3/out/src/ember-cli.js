"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
const file_ops_1 = require("./file-ops");
const typing_ops_1 = require("./typing-ops");
const ember_ops_1 = require("./ember-ops");
const helpers_1 = require("./helpers");
const dumb_cache_1 = require("./dumb-cache");
class EmberCliManager {
    constructor() {
        this._cache = new dumb_cache_1.default({ preload: true });
    }
    /**
     * All the methods below map 1:1 to an ember-cli operation
     * Each command should just invoke the ember cli command,
     * except in cases where we want the user to enter more input,
     * or when we want to "massage" the command.
     */
    // ember addon
    addon() {
        let addonOps = new ember_ops_1.EmberOperation("addon", {
            isOutputChannelVisible: false
        });
        addonOps
            .run()
            .then((result) => {
            if (result && result.code === 0) {
                vscode_1.window.showInformationMessage("Addon folder structure created!");
            }
            else {
                vscode_1.window.showErrorMessage("Addon folder structure creation failed.");
            }
        });
    }
    // ember version
    version() {
        let versionOps = new ember_ops_1.EmberOperation("version", {
            isOutputChannelVisible: false
        });
        versionOps
            .run()
            .then((result) => {
            if (result.code === 0) {
                vscode_1.window.showInformationMessage("Ember Cli " + result.stdout);
            }
        });
    }
    // ember install
    install() {
        vscode_1.window.showInputBox({
            prompt: "Name of the addon to install?"
        }).then((result) => {
            if (!result || result === "") {
                return;
            }
            ;
            let installOp = new ember_ops_1.EmberOperation(["install", result]);
            installOp.run();
        });
    }
    // ember new
    new() {
        vscode_1.window.showInputBox({
            prompt: "Name of the new application?"
        }).then((result) => {
            if (!result || result === "") {
                return;
            }
            ;
            let newOp = new ember_ops_1.EmberOperation(["new", result]);
            newOp.run();
            this.setupProject();
        });
    }
    // ember init
    init() {
        let initOp = new ember_ops_1.EmberOperation(["init"]);
        initOp.run();
        this.setupProject();
    }
    // ember build
    build() {
        let quickPickItems = [
            {
                label: "development",
                description: "Build with env=development"
            },
            {
                label: "production",
                description: "Build with env=production"
            }
        ];
        vscode_1.window.showQuickPick(quickPickItems).then((result) => {
            if (!result) {
                return;
            }
            ;
            let envarg = (result.label === "development") ? "-dev" : "-prod";
            let buildOp = new ember_ops_1.EmberOperation(["build", envarg]);
            buildOp.run().then((result) => {
                if (result.code === 0) {
                    vscode_1.window.showInformationMessage("Project successfully built!");
                }
            });
        });
    }
    // ember serve
    serve() {
        if (this._cache.serveOperation) {
            let quickPickItems = [
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
            vscode_1.window.showQuickPick(quickPickItems).then((result) => {
                if (result.label === "Show Output") {
                    this._cache.serveOperation.showOutputChannel();
                }
                else if (result.label === "Stop") {
                    this._cache.serveOperation.kill();
                    this._cache.serveOperation.dispose();
                    this._cache.serveOperation = null;
                }
                else {
                    this._cache.serveOperation.kill();
                    this._cache.serveOperation.dispose();
                    this._cache.serveOperation = new ember_ops_1.EmberOperation("serve");
                    this._cache.serveOperation.run();
                }
            });
        }
        else {
            this._cache.serveOperation = new ember_ops_1.EmberOperation("serve");
            this._cache.serveOperation.run();
        }
    }
    // ember generate & ember destroy
    blueprint(type) {
        if (!this._cache.generateChoices) {
            return this._cache.preload().then(() => this.blueprint(type));
        }
        if (type !== "generate" && type !== "destroy") {
            return;
        }
        ;
        let qpChoices = this._cache.generateChoices.map((element) => {
            return {
                label: element.name,
                description: element.description,
                anonymousOptions: element.anonymousOptions,
                availableOptions: element.availableOptions
            };
        });
        vscode_1.window.showQuickPick(qpChoices, {
            placeHolder: `Which blueprint do you want to ${type}?`
        }).then((result) => {
            if (!result) {
                return;
            }
            ;
            let optionPromises = [];
            let optionResults = [];
            let gdName;
            let i = 0;
            if (result.anonymousOptions && result.anonymousOptions.length > 0) {
                for (i = 0; i < result.anonymousOptions.length; i++) {
                    let name = result.anonymousOptions[i];
                    optionPromises.push(vscode_1.window.showInputBox({
                        prompt: `${helpers_1.capitalizeFirstLetter(name)}?`
                    }).then((promptResult) => {
                        optionResults.push(promptResult);
                        gdName = (i === 1) ? promptResult : gdName;
                    }));
                }
            }
            Promise.all(optionPromises).then((results) => {
                let generateArgs = optionResults.join(" ");
                let blueprintOp = new ember_ops_1.EmberOperation([type, result.label, generateArgs], {
                    isOutputChannelVisible: false
                });
                blueprintOp.run().then((result) => {
                    if (result.code === 0) {
                        let message = `${gdName} sucessfully ${(type === "generate") ? "generated" : "destroyed"}!`;
                        vscode_1.window.showInformationMessage(message);
                    }
                });
            });
        });
    }
    // ember test
    test() {
        let testOp = new ember_ops_1.EmberOperation(["test"]);
        testOp.run().then((result) => {
            if (result && result.code === 0) {
                vscode_1.window.showInformationMessage("Tests passed with code " + result.code);
            }
            else {
                vscode_1.window.showErrorMessage("Tests failed with error code " + result.code);
            }
        });
    }
    // ember test (server)
    testServer() {
        if (this._cache.testServeOperation) {
            let quickPickItems = [
                {
                    label: "Restart",
                    description: "Restart the serve process"
                },
                {
                    label: "Stop",
                    description: "Kill the serve process"
                }
            ];
            vscode_1.window.showQuickPick(quickPickItems).then((result) => {
                if (result.label === "Stop") {
                    this._cache.testServeOperation.kill();
                    this._cache.testServeOperation.dispose();
                    this._cache.testServeOperation = null;
                    vscode_1.window.showInformationMessage("Ember Cli: Test Server stopped");
                }
                else {
                    this._cache.testServeOperation.kill();
                    this._cache.testServeOperation.dispose();
                    this._cache.testServeOperation = new ember_ops_1.EmberOperation(["test", "--server"], {
                        isOutputChannelVisible: false
                    });
                    this._cache.testServeOperation.run();
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
    }
    // Install Ember Typings
    installTypings() {
        return typing_ops_1.installTypings();
    }
    /*
    // Helper Functions
    */
    // Is the current project setup for Visual Studio Code?
    isProjectSetup() {
        return false;
    }
    // Is the current project an Ember Cli project?
    isProjectEmberCli() {
        return true;
    }
    // Set the project up
    setupProject() {
        if (!vscode_1.workspace || !vscode_1.workspace.rootPath) {
            return false;
        }
        file_ops_1.appendJSConfig(constants_1.jsConfig);
        typing_ops_1.installTypings();
    }
}
exports.EmberCliManager = EmberCliManager;
//# sourceMappingURL=ember-cli.js.map