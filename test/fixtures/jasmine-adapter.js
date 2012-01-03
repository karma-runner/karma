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
  };

  this.reportRunnerResults = function(runner) {
    __slimjim__.complete();
  };

  this.reportSuiteResults = function(suite) {
  };

  this.reportSpecStarting = function(spec) {
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
      var items = spec.results_.items_;
      for (var i = 0; i < items.length; i++) {
        if (items[i].trace) {
          result.log.push(items[i].trace.stack);
        }
      }
    }

    __slimjim__.result(result);
  };

  this.log = function() {
  };
};

__slimjim__.start = function(config) {
  var jasmineEnv = jasmine.getEnv();
//  jasmineEnv.specFilter = function(spec) {};
  jasmineEnv.addReporter(new SimpleReporter());
  jasmineEnv.execute();
};
