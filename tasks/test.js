module.exports = function (grunt) {
  /**
   * Run tests
   *
   * grunt test
   * grunt test:unit
   * grunt test:client
   */
  grunt.registerMultiTask('test', 'Run tests.', function () {
    const specDone = this.async()
    const node = require('which').sync('node')
    const path = require('path')
    const cmd = path.join(__dirname, '..', 'bin', 'karma')

    function spawnKarma (args, callback) {
      grunt.log.writeln(['Running', cmd].concat(args).join(' '))
      var child
      if (process.platform === 'win32') {
        child = grunt.util.spawn({ cmd: node, args: [cmd].concat(args) }, callback)
      } else {
        child = grunt.util.spawn({ cmd: cmd, args: args }, callback)
      }
      child.stdout.pipe(process.stdout)
      child.stderr.pipe(process.stderr)
    }

    function exec (args, failMsg) {
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
