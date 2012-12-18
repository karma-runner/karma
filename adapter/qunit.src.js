var createQUnitStartFn = function (tc) {
	return function (runner) {
		(function (tc, runner) {
			var totalNumberOfTest = 0;
			var timer = null;
      var testResult = {};

			runner.done(function () {
				tc.info({ total: totalNumberOfTest });
				tc.complete({
         coverage: window.__coverage__
        });
			});

			runner.testStart(function (test) {
				totalNumberOfTest += 1;
				timer = new Date().getTime();
        testResult = { success: true, errors: [] };
			});
      
      runner.log(function (details) {
        if (!details.result) {
          testResult.success = false;
          testResult.errors.push(details.message + (details.source ? ('\n' + details.source) : ''));
        }
      });

			runner.testDone(function (test) {
				var result = {
					description: test.name,
					suite: [test.module] || [],
					success: testResult.success,
					log: testResult.errors || [],
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
