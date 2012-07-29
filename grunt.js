module.exports = function(grunt) {

var BROWSERS = process.env.TRAVIS ? 'Firefox' : 'Chrome,ChromeCanary,Firefox,Opera,Safari,PhantomJS';

  // Project configuration.
  grunt.initConfig({
    files: {
      server: ['lib/*.js'],
      client: ['static/testacular.src.js'],
      jasmine: ['adapter/jasmine.src.js'],
      mocha: ['adapter/mocha.src.js']
    },

    lint: {
      server: '<config:files.server>',
      client: '<config:files.client>',
      jasmine: '<config:files.jasmine>',
      mocha: '<config:files.mocha>'
    },

    build: {
      client: '<config:files.client>',
      jasmine: '<config:files.jasmine>',
      mocha: '<config:files.mocha>'
    },

    test: {
      unit: 'test/unit',
      client: 'test/client/config.js',
      e2e: 'test/e2e/*/testacular.conf.js'
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      },
      globals: {}
    }
  });



  // Default task.
  grunt.registerTask('default', 'lint test docs');


  grunt.registerMultiTask('build', 'Concat and wrap given files.', function() {
    var src = grunt.file.expandFiles(this.data).pop();
    var dest = src.replace('src.js', 'js');
    var wrapper = src.replace('src.js', 'wrapper');

    grunt.file.copy(wrapper, dest, {process: function(content) {
      var wrappers = content.split('%CONTENT%\n');
      return wrappers[0] + grunt.file.read(src) + wrappers[1];
    }});

    grunt.log.ok('Created ' + dest);
  });


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


  grunt.registerTask('npm-check', 'Show list of files that would be published to npm', function() {
    var exec = require('child_process').exec;
    var done = this.async();

    exec('npm pack', function(err, pkgFile) {
      exec('tar -tf ' + pkgFile, function(err, pkgContent) {
        console.log(pkgContent);
        exec('rm ' + pkgFile, done);
      });
    });
  });


  grunt.registerTask('release', 'Increment version, generate changelog, create tag and push', function(type) {
    var exec = require('child_process').exec;
    var finish = this.async();
    var queue = [];
    var next = function() {
      var cmd = queue.shift();

      if (!cmd) return finish();

      exec(cmd[0], function(err, output) {
        if (err) return grunt.fail.fatal(err.message.replace(/\n$/, '.'));
        if (cmd[1]) grunt.log.ok(cmd[1]);
        if (cmd[2]) cmd[2](output);
        next();
      });
    };

    var run = function(cmd, msg, fn) {
      queue.push([cmd, msg, fn]);
    };


    // increment the version
    var package = grunt.file.readJSON('package.json');
    var previousVersion = package.version;
    var newVersion = package.version = grunt.helper('bump_version', previousVersion, type);

    // write updated package.json
    grunt.file.write('package.json', JSON.stringify(package, null, '  '));
    grunt.log.ok('Version bumped to ' + newVersion);

    // generate changelog
    run('git log --grep=\\[changelog\\] --pretty="* %s" v' + previousVersion + '..HEAD', null, function(log) {
      var title = '### v' + newVersion + '\n';
      var changelog = grunt.file.read('CHANGELOG.md');
      grunt.file.write('CHANGELOG.md', title + log + '\n' + changelog);
    });

    run('sublime -w CHANGELOG.md', 'CHANGELOG.md updated');
    run('git commit package.json CHANGELOG.md -m "Version ' + newVersion + '"', 'Changes committed');
    run('git tag -a v' + newVersion + ' -m "Version ' + newVersion + '"', 'New tag "v' + newVersion + '" created')
    run('git push origin master --tags', 'Pushed to github');
    run('npm publish', 'Published to NPM');
    next();
  });


  grunt.registerHelper('bump_version', function(version, versionType) {
    var type = {
      patch: 2,
      minor: 1,
      major: 0
    };

    var parts = version.split('.');
    var idx = type[versionType || 'patch'];

    parts[idx] = parseInt(parts[idx], 10) + 1;
    while(++idx < parts.length) {
      parts[idx] = 0;
    }
    return parts.join('.');
  });
};
