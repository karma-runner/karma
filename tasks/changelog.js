module.exports = function(grunt) {

  var exec = require('child_process').exec;
  var changelog = require('./../scripts/changelog');

  var DESC = 'Generate changelog.';
  grunt.registerTask('changelog', DESC, function(type) {

    var done = this.async();
    var pkg = grunt.file.readJSON(grunt.config('pkgFile'));

    // generate changelog
    changelog.generate('v' + pkg.version).then(function(data) {
      grunt.file.write('CHANGELOG.md', data + grunt.file.read('CHANGELOG.md'));
      exec('sublime -w CHANGELOG.md', 'CHANGELOG.md updated', function(err) {
        if (err) {
          return grunt.fatal('Can not generate changelog.');
        }

        grunt.log.ok('CHANGELOG.md updated');
        done();
      });
    });
  });
};
