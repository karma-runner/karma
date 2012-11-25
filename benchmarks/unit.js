// benchmarks/unit.js
var path = require('path');

var basePath = path.resolve(__dirname, '..');
// Create a spawnable test task. Doesnt actually spawn until called.
var unitTask = require('grunt-benchmark').spawnTask('test:unit', {

  // Text trigger to look for to know when to run the next step or exit
  trigger: 'Done, without errors.',

  // Base folder and Gruntfile
  // You'll want to setup a fixture base folder and Gruntfile.js
  // to ensure your Grunt'ing appropriately
  base: basePath,
  gruntfile: path.resolve(basePath, 'Gruntfile.coffee')

  // Additional Grunt options can be specified here

});

// Our actual benchmark
module.exports = {
  'unit tests': function(done) {
    // start the watch task
    unitTask(function() {}, function(result) {
      // All done, do something more with the output result or finish up the benchmark
      done();
    });
  }
};