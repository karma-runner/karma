module.exports = function(grunt) {

  var exec = require('child_process').exec;

  grunt.registerTask('contributors', 'Update contributors in package.json', function() {
    var done = this.async();

    exec('git log --pretty=short | git shortlog -nse', function(err, stdout, stderr) {
      var pkgFile = grunt.config('pkgFile');
      var pkg = grunt.file.readJSON(pkgFile);

      pkg.contributors = stdout.toString().split('\n').slice(1, -1).map(function(line) {
        return line.replace(/^[\W\d]+/, '');
      });

      grunt.file.write(pkgFile, JSON.stringify(pkg, null, '  ') + '\n');

      exec('git status -s ' + pkgFile, function(err, stdout) {
        if (!stdout) {
          grunt.log.ok('The contributors list is already up to date.');
          return done();
        }

        exec('git commit ' + pkgFile + ' -m "chore: update contributors"', function(err) {
          if (err) {
            grunt.log.error('Cannot commit contributors changes.');
          } else {
            grunt.log.ok('The contributors list has been updated.');
          }
          done();
        });
      });
    });
  });
};
