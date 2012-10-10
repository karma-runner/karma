var u = require('../util');


var MultiReporter = function() {
  var reporters = this.reporters = [];

  this.addAdapter = function(adapter) {
    reporters.forEach(function(reporter) {
      reporter.adapters.push(adapter);
    });
  };

  this.removeAdapter = function(adapter) {
    reporters.forEach(function(reporter) {
      u.arrayRemove(reporter.adapters, adapter);
    });
  };
};


// PUBLISH
module.exports = MultiReporter;
