module.exports = function (grunt) {
  /**
   * Initialize development environment for Karma
   *
   * - register git hooks (commit-msg)
   */
  grunt.registerTask('init-dev-env', 'Initialize dev environment.', function () {
    const fs = require('fs')
    const done = this.async()

    fs.symlink('../../tasks/lib/validate-commit-msg.js', '.git/hooks/commit-msg', function (e) {
      if (!e) {
        grunt.log.ok('Hook "validate-commit-msg" installed.')
      }
      done()
    })
  })
}
