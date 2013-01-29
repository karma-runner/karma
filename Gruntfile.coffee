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
      jasmine: ['adapter/jasmine.src.js']
      mocha: ['adapter/mocha.src.js']
      ngScenario: ['adapter/angular-scenario.src.js']
      require: ['adapter/require.src.js']
      qunit: ['adapter/qunit.src.js']
      grunt: ['grunt.js', 'tasks/**/*.js']

    build:
      client: '<%= files.client %>'
      jasmine: '<%= files.jasmine %>'
      mocha: '<%= files.mocha %>'
      ngScenario: '<%= files.ngScenario %>'
      require: '<%= files.require %>'
      qunit: '<%= files.qunit %>'

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
          'test/mocha-common.js'
          'test/unit/**/*.coffee'
        ]
      tasks:
        src: [
          'test/mocha-common.js'
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
      jasmine:
        files:
          src: '<%= files.jasmine %>'
        options: JSHINT_BROWSER
      mocha:
        files:
          src: '<%= files.mocha %>'
        options: JSHINT_BROWSER
      qunit:
        files:
          src: '<%= files.qunit %>'
        options: JSHINT_BROWSER
      ngScenario:
        files:
          src: '<%= files.ngScenario %>'
        options: JSHINT_BROWSER
      require:
        files:
          src: '<%= files.require %>'
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

    # Docs
    'docs-build':
      options:
        copy:
          'dev/01_contributing': 'CONTRIBUTING'
          'about/01_changelog': 'CHANGELOG'
      main:  
        files:
          'docs/build/public': 'docs/src'

    mincss:
      docs:
        files:
          'docs/template/build/assets/css/app.css': 'docs/template/build/assets/css/app.css'
    uglify:
      docs:
        files:
          'docs/template/build/assets/js/app.js': [
            'docs/template/src/js/jquery.js'
            'docs/template/src/js/jquery.easing.js'
            'docs/template/src/js/ddsmoothmenu.js'
            'docs/template/src/js/jquery.flexslider.js'
            'docs/template/src/js/colortip.js'
            'docs/template/src/js/selectnav.js'
            'docs/template/src/js/custom.js'
          ]
    less:
      docs:
        files:
          'docs/template/build/assets/css/app.css': 'docs/template/src/less/app.less'

    connect:
      docs:
        options:
          port: 9000
          keepalive: true
          base: 'docs/build'

    
  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-simple-mocha'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-mincss'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-connect'

  grunt.registerTask 'default', ['build', 'jshint', 'test']
  grunt.registerTask 'release', 'Build, bump and publish to NPM.', (type) ->
    grunt.task.run [
      'build',
      "bump:#{type||'patch'}",
      'npm-publish'
    ]

  grunt.registerTask 'docs', [
    'less:docs'
    'mincss:docs'
    'uglify:docs'
    'docs-build:main'
  ]