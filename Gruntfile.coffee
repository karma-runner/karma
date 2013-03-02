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
      client: ['static/testacular.src.js']
      grunt: ['grunt.js', 'tasks/**/*.js']

    build:
      client: '<%= files.client %>'

    test:
      unit: 'simplemocha:unit'
      tasks: 'simplemocha:tasks'
      client: 'test/client/testacular.conf.js'
      e2e: 'test/e2e/*/testacular.conf.js'


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

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-simple-mocha'
  grunt.loadNpmTasks 'grunt-contrib-jshint'

  grunt.registerTask 'default', ['build', 'jshint', 'test']
  grunt.registerTask 'release', 'Build, bump and publish to NPM.', (type) ->
    grunt.task.run [
      'contributors'
      'build'
      "bump:#{type||'patch'}"
      'npm-publish'
    ]
