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
    var node = require('which').sync('node');
    var path = require('path');
    var cmd = path.join(__dirname, '..', 'bin', 'karma');

    var spawnKarma = function(args, callback) {
      grunt.log.writeln(['Running', cmd].concat(args).join(' '));
      var child;
      if (process.platform === 'win32') {
        child = grunt.util.spawn({cmd: node, args: [cmd].concat(args)}, callback);
      } else {
        child = grunt.util.spawn({cmd: cmd, args: args}, callback);
      }
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    };

    var exec = function(args, failMsg) {
      spawnKarma(args, function(err, result, code) {
        if (code) {
          console.error(err);
          grunt.fail.fatal(failMsg, code);
        } else {
          specDone();
        }
      });
    };


    // E2E tests
    if (this.target === 'e2e') {
      var tests = grunt.file.expand(this.data);
      var processToKill;
      var args = [
        'start', null, '--single-run', '--no-auto-watch'
      ];


      var next = function(err, result, code) {
        var testArgs = [];
        if (processToKill) {
          processToKill.kill();
        }

        if (err || code) {
          console.error(err);
          grunt.fail.fatal('E2E test "' + args[1] + '" failed.', code);
        } else {
          args[1] = tests.shift();
          if (args[1]) {
            if (args[1] === 'test/e2e/angular-scenario/karma.conf.js') {
              processToKill = grunt.util.spawn({
                cmd: node,
                args: ['test/e2e/angular-scenario/server.js']
              }, function() {});
            }

            if (args[1] === 'test/e2e/pass-opts/karma.conf.js') {
              var serverArgs = args.slice();
              serverArgs.splice(args.indexOf('--single-run'), 1);
              var done = false;
              var cont = function() {
                if (!done) {
                  done = true;
                  next.apply(this, arguments);
                }
              };

              processToKill = grunt.util.spawn({
                cmd: node,
                args: [cmd].concat(serverArgs),
                opts: {stdio: [process.stdin, 'pipe', process.stderr]}
              }, cont);

              var onData = function(data) {
                data = data.toString();
                // wait for the browser to connect
                if (/Connected on socket/.test(data)) {
                  processToKill.stdout.removeListener('data', onData);
                  spawnKarma(['run', '--','arg1','arg2','arg3'], cont);
                } else {
                  console.log(data);
                }
              };

              processToKill.stdout.on('data', onData);
            } else {
              spawnKarma(args.concat(testArgs), next);
            }
          } else {
            specDone();
          }
        }
      };


      // run only e2e tests specified by args
      if (arguments.length) {
        var slicedArgs = Array.prototype.slice.call(arguments);

        tests = tests.filter(function(configFile) {
          return slicedArgs.some(function(test) {
            return configFile.indexOf(test) !== -1;
          });
        });
      }

      return next();
    }

    // CLIENT unit tests
    if (this.target === 'client') {
      return exec(['start', this.data, '--single-run', '--no-auto-watch', '--reporters=dots'],
          'Client unit tests failed.');
    }

    // UNIT tests or TASK tests
    grunt.task.run([this.data]);
    specDone();
  });
};
