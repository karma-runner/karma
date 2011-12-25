/**
 * Very simple reporter for jasmine
 */
var SimpleReporter = function() {

  this.reportRunnerStarting = function(runner) {
    var count = runner.specs().length;
    console.log('start runner', count);
    window.parent.socket.emit('result', 'Running ' + count + ' specs...');
  };

  this.reportRunnerResults = function(runner) {
    console.log('complete');
    window.parent.socket.emit('result', 'COMPLETE');
  };

  this.reportSuiteResults = function(suite) {
    console.log('suite');
  };

  this.reportSpecStarting = function(spec) {
    console.log('start spec: ' + spec.suite.description + ' ' + spec.description + '...');
  };

  this.reportSpecResults = function(spec) {
    var result = spec.results_.failedCount === 0 ? 'PASSED' : 'FAILED';
    window.parent.socket.emit('result', spec.suite.description + ': ' + spec.description + ' -- ' + result);
    console.log('spec result', spec);
  };

  this.log = function() {
    console.log('LOG', arguments);
  };
};

window.addEventListener('DOMContentLoaded', function() {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.addReporter(new SimpleReporter());
  jasmineEnv.execute();
});

//      jasmineEnv.updateInterval = 1000;
//      jasmineEnv.specFilter = function(spec) {
//        return trivialReporter.specFilter(spec);
//      };
