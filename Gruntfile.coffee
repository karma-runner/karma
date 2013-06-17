# JS Hint options
JSHINT_BROWSER =
  browser: true,
  es5: true,
  strict: false
  undef: false
  camelcase: false

JSHINT_NODE =
  node: true,
  es5: true,
  strict: false

module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkgFile: 'package.json'

    files:
      server: ['lib/**/*.js']
      client: ['static/karma.src.js']
      grunt: ['grunt.js', 'tasks/**/*.js']
      scripts: ['scripts/*.js']

    build:
      client: '<%= files.client %>'

    test:
      unit: 'simplemocha:unit'
      tasks: 'simplemocha:tasks'
      client: 'test/client/karma.conf.js'
      e2e: ['test/e2e/*/karma.conf.js', 'test/e2e/*/karma.conf.coffee']


    simplemocha:
      options:
        ui: 'bdd'
        reporter: 'dot'
      unit:
        src: [
          'test/unit/mocha-globals.coffee'
          'test/unit/**/*.coffee'
        ]
      tasks:
        src: [
          'test/tasks/mocha-globals.coffee'
          'test/tasks/**/*.coffee'
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

    'npm-publish':
      options:
        requires: ['build']
        abortIfDirty: true
        tag: ->
          pkg = grunt.file.readJSON grunt.config 'pkgFile'
          minor = parseInt pkg.version.split('.')[1], 10
          if (minor % 2) then 'canary' else 'latest'
    'npm-contributors':
      options:
        commitMessage: 'chore: update contributors'

    bump:
      options:
        commitFiles: ['package.json', 'CHANGELOG.md']
        commitMessage: 'chore: release v%VERSION%'
        pushTo: 'upstream'


  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-simple-mocha'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-bump'
  grunt.loadNpmTasks 'grunt-npm'

  grunt.registerTask 'default', ['build', 'test', 'jshint', 'coffeelint']
  grunt.registerTask 'release', 'Build, bump and publish to NPM.', (type) ->
    grunt.task.run [
      'npm-contributors'
      'build'
      "changelog:#{type||'patch'}"
      "bump:#{type||'patch'}"
      'npm-publish'
    ]
