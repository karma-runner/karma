var formatFailedStep = function(step) {

  var stack = step.trace.stack;
  if (stack) {
    if (step.trace.message && stack.indexOf(step.trace.message) === -1) {
      stack = step.trace.message + '\n' + stack;
    }

    // remove jasmine stack entries
    return stack.replace(/\n.+jasmine\.js\?\d*\:.+(?=(\n|$))/g, '');
  }

  return step.trace.message || step.message;
};


/**
 * Very simple reporter for jasmine
 */
var SimpleReporter = function(sj) {

  var failedIds = [];

  this.reportRunnerStarting = function(runner) {
    sj.info({total: runner.specs().length});
  };

  this.reportRunnerResults = function(runner) {
    sj.store('jasmine.lastFailedIds', failedIds);
    sj.complete();
  };

  this.reportSuiteResults = function(suite) {
  };

  this.reportSpecStarting = function(spec) {
  };

  this.reportSpecResults = function(spec) {
    if (spec.results_.skipped) return;

    var result = {
      id: spec.id,
      description: spec.description,
      suite: [],
      success: spec.results_.failedCount === 0,
      log: []
    };

    var suitePointer = spec.suite;
    while (suitePointer) {
      result.suite.unshift(suitePointer.description);
      suitePointer = suitePointer.parentSuite;
    }

    if (!result.success) {
      var steps = spec.results_.items_;
      for (var i = 0; i < steps.length; i++) {
        if (!steps[i].passed_) {
          result.log.push(formatFailedStep(steps[i]));
        }
      }

      failedIds.push(result.id);
    }

    sj.result(result);
  };

  this.log = function() {};
};


var createStartFn = function(sj, jasmineEnv) {
  return function(config) {
    // we pass jasmineEnv during testing
    // in production we ask for it lazily, so that adapter can be loaded even before jasmine
    jasmineEnv = jasmineEnv || window.jasmine.getEnv();

    var currentSpecsCount = jasmineEnv.nextSpecId_;
    var lastCount = sj.store('jasmine.lastCount');
    var lastFailedIds = sj.store('jasmine.lastFailedIds');

    sj.store('jasmine.lastCount', currentSpecsCount);
    sj.store('jasmine.lastFailedIds', []);

    // filter only last failed specs
    if (lastCount === currentSpecsCount && // still same number of specs
        lastFailedIds.length > 0 &&        // at least one fail last run
        !jasmineEnv.exclusive_) {          // no exclusive mode (iit, ddesc)

      jasmineEnv.specFilter = function(spec) {
        return lastFailedIds.indexOf(spec.id) !== -1;
      };
    }

    jasmineEnv.addReporter(new SimpleReporter(sj));
    jasmineEnv.execute();
  };
};


var createDumpFn = function(sj, serialize) {
  return function() {

    var args = Array.prototype.slice.call(arguments, 0);

    if (serialize) {
      for (var i = 0; i < args.length; i++) {
        args[i] = serialize(args[i]);
      }
    }

    sj.info({dump: args});

    if (window.console) {
      window.console.log.apply(window.console, arguments);
    }
  };
};
