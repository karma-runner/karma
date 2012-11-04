(function (window) {

    var formatError = function () {
        var errorMessages = [];
        var messages = QUnit.config.current.assertions;
        for (var i = 0, l = messages.length; i < l; i++) {
            if (messages[i].message.indexOf("<pre>") > 0) {
                errorMessages.push(messages[i].message.replace(/^(.*?)<pre>/, '').replace(/<\/pre>(.*?)$/, ''));
            }
        }
        return errorMessages;
    };

    var createQUnitStartFn = function (qunit) {
        return function (config) {
            (function (tc, runner) {
                var totalNumberOfTest = 0;
                var timer = null;

                runner.done(function () {
                    //debugger;
                    tc.info({ total: totalNumberOfTest });
                    tc.complete();
                });

                runner.testStart(function (test) {
                    totalNumberOfTest += 1;
                    test.$errors = [];
                    timer = new Date().getTime();
                });

                runner.testDone(function (test) {
                    var result = {
                        description: test.name,
                        suite: [test.module] || [],
                        success: test.failed === 0,
                        log: formatError() || [],
                        time: new Date().getTime() - timer
                    };

                    if (!result.success) {

                    }

                    tc.result(result);
                });
            })(window.__testacular__, qunit);
        };
    };

    var createDumpFn = function (tc, serialize) {
        return function () {

            var args = Array.prototype.slice.call(arguments, 0);

            if (serialize) {
                for (var i = 0; i < args.length; i++) {
                    args[i] = serialize(args[i]);
                }
            }

            tc.info({ dump: args });
        };
    };


    window.__testacular__.start = createQUnitStartFn(window.QUnit);
    window.dump = createDumpFn(window.__testacular__, function (value) {
        return window.angular && window.angular.mock && window.angular.mock.dump(value) || value;
    });
})(window);
