# JS Hint options
JSHINT_BROWSER =
  browser: true,
  strict: false
  undef: false
  camelcase: false

JSHINT_NODE =
  node: true,
  strict: false

module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    pkgFile: 'package.json'

    files:
      server: ['lib/**/*.js']
      client: ['client/**/*.js']
      grunt: ['grunt.js', 'tasks/*.js']
      scripts: ['scripts/init-dev-env.js']

    browserify:
      client:
        files:
          'static/karma.js': ['client/main.js']

    test:
      unit: 'simplemocha:unit'
      client: 'test/client/karma.conf.js'
      e2e: ['test/e2e/*/karma.conf.js', 'test/e2e/*/karma.conf.coffee', 'test/e2e/*/karma.conf.ls']

    watch:
      client:
        files: '<%= files.client %>'
        tasks: 'browserify:client'

    simplemocha:
      options:
        ui: 'bdd'
        reporter: 'dot'
      unit:
        src: [
          'test/unit/mocha-globals.coffee'
          'test/unit/**/*.coffee'
        ]

    # JSHint options
    # http://www.jshint.com/options/
    jshint:
      server:
        files:
          src: '<%= files.server %>'
        options: JSHINT_NODE
      grunt:
        files:
          src: '<%= files.grunt %>'
        options: JSHINT_NODE
      scripts:
        files:
          src: '<%= files.scripts %>'
        options: JSHINT_NODE
      client:
        files:
          src: '<%= files.client %>'
        options: JSHINT_BROWSER

      options:
        quotmark: 'single'
        bitwise: true
        freeze: true
        indent: 2
        camelcase: true
        strict: true
        trailing: true
        curly: true
        eqeqeq: true
        immed: true
        latedef: true
        newcap: true
        noempty: true
        unused: true
        noarg: true
        sub: true
        undef: true
        maxdepth: 4
        maxstatements: 100
        maxcomplexity: 100
        maxlen: 100
        globals: {}

    # CoffeeLint options
    # http://www.coffeelint.org/#options
    coffeelint:
      unittests: files: src: ['test/unit/**/*.coffee']
      taskstests: files: src: ['test/tasks/**/*.coffee']
      options:
        max_line_length:
          value: 100

    jscs:
      server: files: src: '<%= files.server %>'
      client: files: src: '<%= files.client %>'
      scripts: files: src: '<%= files.scripts %>'
      grunt: files: src: '<%= files.grunt %>'
      options:
        config: '.jscs.json'

    'npm-publish':
      options:
        requires: ['build']
        abortIfDirty: true
        tag: ->
          minor = parseInt grunt.config('pkg.version').split('.')[1], 10
          if (minor % 2) then 'canary' else 'latest'

    'npm-contributors':
      options:
        commitMessage: 'chore: update contributors'

    bump:
      options:
        updateConfigs: ['pkg']
        commitFiles: ['package.json', 'CHANGELOG.md']
        commitMessage: 'chore: release v%VERSION%'
        push: false,
        # A crazy hack.
        # TODO(vojta): fix grunt-bump
        gitDescribeOptions: '| echo "beta-$(git rev-parse --short HEAD)"'


  grunt.loadTasks 'tasks'
  # Load grunt tasks automatically
  require('load-grunt-tasks') grunt

  grunt.registerTask 'build', ['browserify:client']
  grunt.registerTask 'default', ['build', 'test', 'lint']
  grunt.registerTask 'lint', ['jshint', 'jscs', 'coffeelint']
  grunt.registerTask 'release', 'Build, bump and publish to NPM.', (type) ->
    grunt.task.run [
      'npm-contributors'
      "bump:#{type||'patch'}:bump-only"
      'build'
      'changelog'
      'bump-commit'
      'npm-publish'
    ]
