var vscode_1 = require('vscode');
var path = require('path');
var fs = require('fs');
var Travis = require('travis-ci');
var TravisStatusIndicator = (function () {
    function TravisStatusIndicator() {
        this._travis = new Travis({ version: '2.0.0' });
    }
    TravisStatusIndicator.prototype.updateStatus = function () {
        var _this = this;
        if (!this._statusBarItem) {
            this._statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
            this._statusBarItem.command = 'extension.updateTravis';
        }
        // Mark statusBarItem as 'loading'
        this._statusBarItem.text = 'Travis CI $(icon octicon-sync)';
        this._statusBarItem.tooltip = 'Fetching Travis CI status for this project...';
        if (this.isTravisProject()) {
            var repo = this.getUserRepo();
            // Display Message Box if not actually a Travis
            if (!repo || repo.length < 2 || repo[0].length === 0 || repo[1].length === 0) {
                this.displayError('Fetching Travis CI build status failed: Could not detect username and repository');
            }
            // Let's attempt getting a build status from Travis
            this._travis.repos(repo[0], repo[1]).get(function (err, res) {
                if (err)
                    return _this.displayError("Travis could not find " + repo[0] + "/" + repo[1]);
                if (!res || !res.repo)
                    return _this.displayError('Travis CI could not find your repository.');
                if (res.repo.last_build_number === null)
                    return _this.displayError('Travis found your repository, but it never ran a test.');
                var started = new Date(res.repo.last_build_started_at);
                var duration = Math.round(res.repo.last_build_duration / 60).toString();
                duration += (duration === '1') ? ' minute' : ' minutes';
                // Build passed
                if (res.repo.last_build_state === 'passed') {
                    var text = 'Build ' + res.repo.last_build_number + ' has passed.\n';
                    text += 'Started: ' + started.toLocaleDateString() + '\n';
                    text += 'Duration: ' + duration;
                    return _this.displaySuccess(text);
                }
                // Build is running
                if (res.repo.last_build_state === 'running') {
                    var text = 'Build ' + res.repo.last_build_number + ' is currently running.\n';
                    text += 'Started: ' + started.toLocaleDateString() + '\n';
                    text += 'Duration: ' + duration;
                    return _this.displayRunning(text);
                }
                // Build has failed
                if (res.repo.last_build_state === 'failed') {
                    var text = 'Build ' + res.repo.last_build_number + ' failed.\n';
                    text += 'Started: ' + started.toLocaleDateString() + '\n';
                    text += 'Duration: ' + duration;
                    return _this.displayFailure(text);
                }
            });
        }
    };
    // Opens the current project on Travis
    TravisStatusIndicator.prototype.openInTravis = function () {
        if (!vscode_1.workspace || !vscode_1.workspace.rootPath || !this.isTravisProject())
            return;
        var open = require('open');
        var repo = this.getUserRepo();
        if (repo && repo.length === 2) {
            return open("https://travis-ci.org/" + repo[0] + "/" + repo[1]);
        }
    };
    // Check if a .travis.yml file is present, which indicates whether or not
    // this is a Travis project
    TravisStatusIndicator.prototype.isTravisProject = function () {
        if (!vscode_1.workspace || !vscode_1.workspace.rootPath)
            return false;
        var conf = path.join(vscode_1.workspace.rootPath, '.travis.yml');
        try {
            return fs.statSync(conf).isFile();
        }
        catch (err) {
            return false;
        }
    };
    // Checks whether or not the current folder has a GitHub remote
    TravisStatusIndicator.prototype.getUserRepo = function () {
        if (!vscode_1.workspace || !vscode_1.workspace.rootPath)
            return null;
        var fSettings = this.getUserRepoFromSettings();
        var fTravis = this.getUserRepoFromTravis();
        // Quick sanity check
        var user = (fSettings && fSettings.length > 0 && fSettings[0]) ? fSettings[0] : fTravis[0];
        var repo = (fSettings && fSettings.length > 1 && fSettings[1]) ? fSettings[1] : fTravis[1];
        return [user, repo];
    };
    // Setup status bar item to display that this plugin is in trouble
    TravisStatusIndicator.prototype.displayError = function (err) {
        this.setupStatusBarItem(err, 'octicon-stop');
    };
    // Setup status bar item to display that the build has passed;
    TravisStatusIndicator.prototype.displaySuccess = function (text) {
        this.setupStatusBarItem(text, 'octicon-check');
    };
    // Setup status bar item to display that the build has failed;
    TravisStatusIndicator.prototype.displayFailure = function (text) {
        this.setupStatusBarItem(text, 'octicon-x');
    };
    // Setup status bar item to display that the build is running;
    TravisStatusIndicator.prototype.displayRunning = function (text) {
        this.setupStatusBarItem(text, 'octicon-clock');
    };
    // Setup StatusBarItem with an icon and a tooltip
    TravisStatusIndicator.prototype.setupStatusBarItem = function (tooltip, icon) {
        if (!this._statusBarItem) {
            this._statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        }
        this._statusBarItem.text = 'Travis CI $(icon ' + icon + ')';
        this._statusBarItem.tooltip = tooltip;
        this._statusBarItem.show();
    };
    // Get the username/repository combo from .vscode/settings.json
    TravisStatusIndicator.prototype.getUserRepoFromSettings = function () {
        if (!vscode_1.workspace || !vscode_1.workspace.rootPath)
            return null;
        var settingsFile = path.join(vscode_1.workspace.rootPath, '.vscode', 'settings.json');
        try {
            var settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
            if (settings) {
                var repo = settings['travis.repository'];
                var user = settings['travis.username'];
                return [user, repo];
            }
            else {
                return ['', ''];
            }
        }
        catch (e) {
            return ['', ''];
        }
    };
    // Get the username/repository combo from .travis.yml
    TravisStatusIndicator.prototype.getUserRepoFromTravis = function () {
        var ini = require('ini');
        var configFile = path.join(vscode_1.workspace.rootPath, '.git', 'config');
        try {
            var config = ini.parse(fs.readFileSync(configFile, 'utf-8'));
            var origin = config['remote "origin"'];
            if (origin && origin.url) {
                // Parse URL, get GitHub username
                var repo = origin.url.replace(/^.*\/\/[^\/]+\//, '');
                var combo = repo.replace(/(\.git)/, '');
                var split = combo.split('/');
                if (split && split.length > 1) {
                    return split;
                }
                else {
                    return ['', ''];
                }
            }
        }
        catch (err) {
            return ['', ''];
        }
    };
    TravisStatusIndicator.prototype.dispose = function () {
        this._statusBarItem.dispose();
    };
    return TravisStatusIndicator;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TravisStatusIndicator;
//# sourceMappingURL=travis-status.js.map