// JS Hint options
var JSHINT_BROWSER = {
  browser: true,
  es5: true
};

var JSHINT_NODE = {
  node: true,
  es5: true
};

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    files: {
      server: ['lib/*.js'],
      client: ['static/testacular.src.js'],
      jasmine: ['adapter/jasmine.src.js'],
      mocha: ['adapter/mocha.src.js'],
      ngScenario: ['adapter/angular-scenario.src.js'],
      grunt: ['grunt.js', 'tasks/*.js']
    },

    lint: {
      server: '<config:files.server>',
      client: '<config:files.client>',
      jasmine: '<config:files.jasmine>',
      mocha: '<config:files.mocha>',
      ngScenario: '<config:files.ngScenario>',
      grunt: '<config:files.grunt>'
    },

    build: {
      client: '<config:files.client>',
      jasmine: '<config:files.jasmine>',
      mocha: '<config:files.mocha>',
      ngScenario: '<config:files.ngScenario>'
    },

    test: {
      unit: 'test/unit',
      client: 'test/client/config.js',
      e2e: 'test/e2e/*/testacular.conf.js'
    },

    // JSHint options
    // http://www.jshint.com/options/
    jshint: {
      server: {
        options: JSHINT_NODE
      },
      grunt: {
        options: JSHINT_NODE
      },
      client: {
        options: JSHINT_BROWSER
      },
      jasmine: {
        options: JSHINT_BROWSER
      },
      mocha: {
        options: JSHINT_BROWSER
      },
      ngScenario: {
        options: JSHINT_BROWSER
      },

      options: {
        quotmark: 'single',
        camelcase: true,
        strict: true,
        trailing: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true
      },
      globals: {}
    }
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', 'build lint test');
  grunt.registerTask('release', 'Build, bump and publish to NPM.', function(type) {
    grunt.task.run('build bump:' + (type || 'patch') + ' npm-publish');
  });
};
