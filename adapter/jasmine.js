if (!window.console || !window.console.log) {
  window.console = {
    log: function() {}
  };
}

window.dump = function() {
  __slimjim__.info(Array.prototype.slice.call(arguments, 0));
};

/**
 * Very simple reporter for jasmine
 * TODO(vojta): don't pollute global ns (need build script that wraps whole file into function)
 */
var SimpleReporter = function(sj, failedIds) {

  this.reportRunnerStarting = function(runner) {
    var count = runner.specs().length;
    sj.info('Running ' + count + ' specs...');
  };

  this.reportRunnerResults = function(runner) {
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
      var items = spec.results_.items_;
      for (var i = 0; i < items.length; i++) {
        if (items[i].trace) {
          result.log.push(items[i].trace.stack);
        }
      }

      failedIds.push(result.id);
    }

    sj.result(result);
  };

  this.log = function() {
  };
};

var createStartFn = function(sj, jasmineEnv) {
  return function(config) {
    var currentFailedIds = [];
    var currentSpecsCount = jasmineEnv.nextSpecId_;
    var lastResults = sj.jasmineLastResults;


    // reset lastResults on parent frame
    sj.jasmineLastResults = {
      failedIds: currentFailedIds,
      count: currentSpecsCount
    };

    // filter only last failed specs
    if (lastResults && lastResults.count === currentSpecsCount && // still same number of specs
        lastResults.failedIds.length > 0 &&                       // at least one fail last run
        !jasmineEnv.exclusive_) {                                 // no exclusive mode (iit, ddesc)

      jasmineEnv.specFilter = function(spec) {
        return lastResults.failedIds.indexOf(spec.id) !== -1;
      };
    }

    jasmineEnv.addReporter(new SimpleReporter(sj, currentFailedIds));
    jasmineEnv.execute();
  };
};


__slimjim__.start = createStartFn(__slimjim__, jasmine.getEnv());
