module.exports = function (grunt) {
  /**
   * Run tests
   *
   * grunt test
   * grunt test:unit
   * grunt test:client
   */
  grunt.registerMultiTask('test', 'Run tests.', function () {
    var specDone = this.async()
    var node = require('which').sync('node')
    var path = require('path')
    var cmd = path.join(__dirname, '..', 'bin', 'karma')

    var spawnKarma = function (args, callback) {
      grunt.log.writeln(['Running', cmd].concat(args).join(' '))
      var child
      if (process.platform === 'win32') {
        child = grunt.util.spawn({cmd: node, args: [cmd].concat(args)}, callback)
      } else {
        child = grunt.util.spawn({cmd: cmd, args: args}, callback)
      }
      child.stdout.pipe(process.stdout)
      child.stderr.pipe(process.stderr)
    }

    var exec = function (args, failMsg) {
      spawnKarma(args, function (err, result, code) {
        if (code) {
          console.error(err)
          grunt.fail.fatal(failMsg, code)
        } else {
          specDone()
        }
      })
    }

    // CLIENT unit tests
    if (this.target === 'client') {
      return exec(['start', this.data, '--single-run', '--no-auto-watch', '--reporters=dots'],
        'Client unit tests failed.')
    }

    // UNIT tests or TASK tests
    grunt.task.run([this.data])
    specDone()
  })
}
