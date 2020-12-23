module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    pkgFile: 'package.json',
    files: {
      server: ['lib/**/*.js'],
      client: ['client/**/*.js'],
      common: ['common/**/*.js'],
      context: ['context/**/*.js'],
      grunt: ['grunt.js', 'tasks/*.js']
    },
    test: {
      unit: 'mochaTest:unit',
      client: 'test/client/karma.conf.js'
    },
    mochaTest: {
      options: {
        reporter: 'dot',
        ui: 'bdd',
        quiet: false,
        colors: true
      },
      unit: {
        src: [
          'test/unit/mocha-globals.js',
          'test/unit/**/*.spec.js'
        ]
      }
    }
  })

  grunt.loadTasks('tasks')
  require('load-grunt-tasks')(grunt)

  grunt.registerTask('default', ['test'])
  grunt.registerTask('test-appveyor', ['test:unit', 'test:client'])
}
