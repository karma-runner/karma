require('colors');

var SpecReporter = function (baseReporterDecorator, formatError, config) {
    baseReporterDecorator(this);

    var platform = process ? process.platform : 'unknown';
    var selectPrefix = function (defaultMarker, win32Marker) {
        return platform === 'win32' ? win32Marker : defaultMarker;
    }
    var reporterCfg = config.specReporter || {};
    this.prefixes = Object.assign({
        success: selectPrefix('✓ ', '\u221A '),
        failure: selectPrefix('✗ ', '\u00D7 '),
        skipped: selectPrefix('- ', '\- ')
    }, reporterCfg.prefixes);

    this.failures = [];
    this.USE_COLORS = false;

    // colorize output of BaseReporter functions
    if (config.colors) {
        this.USE_COLORS = true;
        this.SPEC_FAILURE = '%s %s FAILED'.red + '\n';
        this.SPEC_SLOW = '%s SLOW %s: %s'.yellow + '\n';
        this.ERROR = '%s ERROR'.red + '\n';
        this.FINISHED_ERROR = ' ERROR'.red;
        this.FINISHED_SUCCESS = ' SUCCESS'.green;
        this.FINISHED_DISCONNECTED = ' DISCONNECTED'.red;
        this.X_FAILED = ' (%d FAILED)'.red;
        this.TOTAL_SUCCESS = 'TOTAL: %d SUCCESS'.green + '\n';
        this.TOTAL_FAILED = 'TOTAL: %d FAILED, %d SUCCESS'.red + '\n';
    }

    this.onRunComplete = function (browsers, results) {
        //NOTE: the renderBrowser function is defined in karma/reporters/Base.js
        this.writeCommonMsg('\n' + browsers.map(this.renderBrowser)
                .join('\n') + '\n');

        if (browsers.length >= 1 && !results.disconnected && !results.error) {
            if (!results.failed) {
                this.write(this.TOTAL_SUCCESS, results.success);
            } else {
                this.write(this.TOTAL_FAILED, results.failed, results.success);
                if (!this.suppressErrorSummary) {
                    this.logFinalErrors(this.failures);
                }
            }
        }

        this.write('\n');
        this.failures = [];
        this.currentSuite = [];
    };

    this.logFinalErrors = function (errors) {
        this.writeCommonMsg('\n\n');
        this.WHITESPACE = '     ';

        errors.forEach(function (failure, index) {
            index = index + 1;

            if (index > 1) {
                this.writeCommonMsg('\n');
            }

            this.writeCommonMsg((index + ') ' + failure.description + '\n').red);
            this.writeCommonMsg((this.WHITESPACE + failure.suite.join(' ') + '\n').red);
            failure.log.forEach(function (log) {
                if (reporterCfg.maxLogLines) {
                    log = log.split('\n').slice(0, reporterCfg.maxLogLines).join('\n');
                }
                this.writeCommonMsg(this.WHITESPACE + formatError(log)
                        .replace(/\\n/g, '\n').grey);
            }, this);
        }, this);

        this.writeCommonMsg('\n');
    };

    this.currentSuite = [];
    this.writeSpecMessage = function (status) {
        return (function (browser, result) {
            var suite = result.suite;
            var indent = "  ";
            suite.forEach(function (value, index) {
                if (index >= this.currentSuite.length || this.currentSuite[index] != value) {
                    if (index === 0) {
                        this.writeCommonMsg('\n');
                    }

                    this.writeCommonMsg(indent + value + '\n');
                    this.currentSuite = [];
                }

                indent += '  ';
            }, this);

            this.currentSuite = suite;

            var specName = result.description;
            var elapsedTime = reporterCfg.showSpecTiming ? ' (' + result.time + 'ms)' : '';

            if (this.USE_COLORS) {
                if (result.skipped) specName = specName.cyan;
                else if (!result.success) specName = specName.red;
            }

            var msg = indent + status + specName + elapsedTime;

            result.log.forEach(function (log) {
                if (reporterCfg.maxLogLines) {
                    log = log.split('\n').slice(0, reporterCfg.maxLogLines).join('\n');
                }
                msg += '\n' + formatError(log, '\t');
            });

            this.writeCommonMsg(msg + '\n');

            // NOTE: other useful properties
            // browser.id;
            // browser.fullName;
        }).bind(this);
    };

    this.LOG_SINGLE_BROWSER = '%s LOG: %s\n';
    this.LOG_MULTI_BROWSER = '%s %s LOG: %s\n';
    var doLog = config && config.browserConsoleLogOptions && config.browserConsoleLogOptions.terminal;
    this.onBrowserLog = doLog ? function (browser, log, type) {
        if (this._browsers && this._browsers.length === 1) {
            this.write(this.LOG_SINGLE_BROWSER, type.toUpperCase(), this.USE_COLORS ? log.cyan : log);
        } else {
            this.write(this.LOG_MULTI_BROWSER, browser, type.toUpperCase(), this.USE_COLORS ? log.cyan : log);
        }
    } : noop;

    function noop() {
    }

    this.onSpecFailure = function (browsers, results) {
        this.failures.push(results);
        this.writeSpecMessage(this.USE_COLORS ? this.prefixes.failure.red : this.prefixes.failure).apply(this, arguments);
        if (reporterCfg.failFast) {
            throw new Error('Fail fast active for tests, exiting(failFast option is enabled)');
        }
    };

    this.specSuccess = reporterCfg.suppressPassed ? noop : this.writeSpecMessage(this.USE_COLORS ? this.prefixes.success.green : this.prefixes.success);
    this.specSkipped = reporterCfg.suppressSkipped ? noop : this.writeSpecMessage(this.USE_COLORS ? this.prefixes.skipped.cyan : this.prefixes.skipped);
    this.specFailure = reporterCfg.suppressFailed ? noop : this.onSpecFailure;
    this.suppressErrorSummary = reporterCfg.suppressErrorSummary || false;
    this.showSpecTiming = reporterCfg.showSpecTiming || false;
};

SpecReporter.$inject = ['baseReporterDecorator', 'formatError', 'config'];

module.exports = {
    'reporter:spec': ['type', SpecReporter]
};

