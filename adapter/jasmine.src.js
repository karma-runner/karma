/**
 * Very simple reporter for jasmine
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
    // we pass jasmineEnv during testing
    // in production we ask for it lazily, so that adapter can be loaded even before jasmine
    jasmineEnv = jasmineEnv || window.jasmine.getEnv();

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
