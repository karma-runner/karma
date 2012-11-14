var formatErrorQUnit = function () {
	var errorMessages = [];
	var messages = QUnit.config.current.assertions;
	for (var i = 0, l = messages.length; i < l; i++) {
		if (messages[i].message.indexOf("<pre>") > 0) {
			errorMessages.push(messages[i].message.replace(/^(.*?)<pre>/, '').replace(/<\/pre>(.*?)$/, ''));
		}
	}
	return errorMessages;
};

var createQUnitStartFn = function (tc) {
	return function (runner) {
		(function (tc, runner) {
			var totalNumberOfTest = 0;
			var timer = null;

			runner.done(function () {
				tc.info({ total: totalNumberOfTest });
				tc.complete();
			});

			runner.testStart(function (test) {
				totalNumberOfTest += 1;
				timer = new Date().getTime();
			});

			runner.testDone(function (test) {
				var result = {
					description: test.name,
					suite: [test.module] || [],
					success: test.failed === 0,
					log: formatErrorQUnit() || [],
					time: new Date().getTime() - timer
				};

				tc.result(result);
			});
		})(tc, window.QUnit);
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
