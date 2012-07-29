module.exports = function(grunt) {

  /**
   * Run tests
   *
   * grunt test
   * grunt test:unit
   * grunt test:client
   * grunt test:e2e
   */
  grunt.registerMultiTask('test', 'Run tests.', function() {
    var specDone = this.async();

    // E2E tests
    if (this.target === 'e2e') {
      var tests = grunt.file.expand(this.data);
      var cmd = './bin/testacular';
      var args = [null, '--single-run', '--no-auto-watch', '--browsers=' + BROWSERS];

      var next = function(err, result, code) {
        if (code) {
          grunt.fail.fatal('E2E test "' + args[0] + '" failed.', code);
        } else {
          args[0] = tests.shift();
          if (args[0]) {
            grunt.log.writeln('Running ' + cmd + args.join(' '));
            grunt.utils.spawn({cmd: cmd, args: args}, next).stdout.pipe(process.stdout);
          } else {
            specDone();
          }
        }
      };

      return next();
    }


    // other: unit, client
    var exec = function(cmd, args, failMsg) {
      grunt.utils.spawn({cmd: cmd, args: args}, function(err, result, code) {
        if (code) {
          grunt.fail.fatal(failMsg, code);
        } else {
          specDone();
        }
      }).stdout.pipe(process.stdout);
    };

    var TASK = {
      unit: [
        'jasmine-node',
        ['--coffee', this.data],
        'Unit tests failed.'
      ],

      client: [
        'testacular',
        [this.data, '--single-run', '--no-auto-watch', '--browsers=' + BROWSERS],
        'Client unit tests failed.'
      ]
    };

    exec.apply(null, TASK[this.target]);
  });
};
