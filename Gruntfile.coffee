# JS Hint options
JSHINT_BROWSER =
  browser: true,
  es5: true,
  strict: false

JSHINT_NODE =
  node: true,
  es5: true,
  strict: false

module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkgFile: 'package.json'

    pkg: '<json:package.json>'

    files:
      server: ['lib/**/*.js']
      client: ['static/testacular.src.js']
      jasmine: ['adapter/jasmine.src.js']
      mocha: ['adapter/mocha.src.js']
      ngScenario: ['adapter/angular-scenario.src.js']
      require: ['adapter/require.src.js']
      grunt: ['grunt.js', 'tasks/*.js']

    lint:
      server: '<%= files.server %>'
      client: '<%= files.client %>'
      jasmine: '<%= files.jasmine %>'
      mocha: '<%= files.mocha %>'
      ngScenario: '<%= files.ngScenario %>'
      require: '<%= files.require %>'
      grunt: '<%= files.grunt %>'

    build:
      client: '<%= files.client %>'
      jasmine: '<%= files.jasmine %>'
      mocha: '<%= files.mocha %>'
      ngScenario: '<%= files.ngScenario %>'
      require: '<%= files.require %>'

    test:
      unit: ''
      client: 'test/client/testacular.conf.js'
      e2e: 'test/e2e/*/testacular.conf.js'

    jasmine_node:
      projectRoot: 'test/unit'
      matchall: true
      verbose: false
      extensions: 'js|coffee'

    # JSHint options
    # http://www.jshint.com/options/
    jshint:
      server:
        options: JSHINT_NODE
      grunt:
        options: JSHINT_NODE
      client:
        options: JSHINT_BROWSER
      jasmine:
        options: JSHINT_BROWSER
      mocha:
        options: JSHINT_BROWSER
      ngScenario:
        options: JSHINT_BROWSER

      options:
        quotmark: 'single'
        camelcase: true
        strict: true
        trailing: true
        curly: true
        eqeqeq: true
        immed: true
        latedef: true
        newcap: true
        noarg: true
        sub: true
        undef: true
        boss: true
      globals: {}

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-jasmine-node'
  grunt.loadNpmTasks 'grunt-contrib-jshint'

  grunt.registerTask 'default', ['build', 'jshint', 'test']
  grunt.registerTask 'release', 'Build, bump and publish to NPM.', (type) ->
    grunt.task.run [
      'build',
      "bump:#{type||'patch'}",
      'npm-publish'
    ]
