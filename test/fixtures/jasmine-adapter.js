if (!window.console || !window.console.log) {
  window.console = {
    log: function() {}
  };
}

/**
 * Very simple reporter for jasmine
 */
var SimpleReporter = function() {

  this.reportRunnerStarting = function(runner) {
    var count = runner.specs().length;
    __slimjim__.info('Running ' + count + ' specs...');
//    console.log('start runner', count);
  };

  this.reportRunnerResults = function(runner) {
    __slimjim__.complete();
//    console.log('complete');
  };

  this.reportSuiteResults = function(suite) {
//    console.log('suite');
  };

  this.reportSpecStarting = function(spec) {
    console.log('start spec', spec);
  };

  this.reportSpecResults = function(spec) {
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
      // TODO(vojta): make it cross browser (.forEach, .stack)
      spec.results_.items_.forEach(function(expectation) {
        if (expectation.trace) {
          result.log.push(expectation.trace.stack);
        }
      });
    }

    __slimjim__.result(result);
//    console.log('spec result', spec);
  };

  this.log = function() {
    console.log('LOG', arguments);
  };
};

__slimjim__.start = function(config) {
  var jasmineEnv = jasmine.getEnv();
//  jasmineEnv.specFilter = function(spec) {};
  jasmineEnv.addReporter(new SimpleReporter());
  jasmineEnv.execute();
};
