module.exports = function(grunt) {
  var TRAVIS = process.env.TRAVIS;
  var BROWSERS = TRAVIS ? 'Firefox' : 'Chrome,ChromeCanary,Firefox,Opera,Safari,PhantomJS';

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
      var args = [
        'start', null, '--single-run', '--no-auto-watch', '--reporter=dots', '--browsers=' + BROWSERS
      ];

      var next = function(err, result, code) {
        if (code) {
          console.error(err);
          grunt.fail.fatal('E2E test "' + args[1] + '" failed.', code);
        } else {
          args[1] = tests.shift();
          if (args[1]) {
            grunt.log.writeln('Running ' + cmd + args.join(' '));
            var child = grunt.utils.spawn({cmd: cmd, args: args}, next);

            child.stdout.pipe(process.stdout);
            child.stderr.pipe(process.stderr);
          } else {
            specDone();
          }
        }
      };

      return next();
    }


    // other: unit, client
    var exec = function(cmd, args, failMsg) {
      var child = grunt.utils.spawn({cmd: cmd, args: args}, function(err, result, code) {
        if (code) {
          console.error(err);
          grunt.fail.fatal(failMsg, code);
        } else {
          specDone();
        }
      });

      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    };

    var TASK = {
      unit: [
        'jasmine-node',
        ['--coffee', this.data],
        'Unit tests failed.'
      ],

      client: [
        'testacular',
        ['start', this.data, '--single-run', '--no-auto-watch', '--reporter=dots', '--browsers=' + BROWSERS],
        'Client unit tests failed.'
      ]
    };

    exec.apply(null, TASK[this.target]);
  });
};
