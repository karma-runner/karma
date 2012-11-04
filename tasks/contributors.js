module.exports = function(grunt) {

  var exec = require('child_process').exec;

  grunt.registerTask('contributors', 'Update contributors in package.json', function() {
    var done = this.async();

    exec('git log --pretty=short | git shortlog -nse', function(err, stdout, stderr) {
      var pkg = grunt.config('pkg');

      pkg.contributors = stdout.toString().split('\n').slice(1, -1).map(function(line) {
        return line.replace(/^[\W\d]+/, '');
      });

      grunt.file.write(grunt.config('pkgFile'), JSON.stringify(pkg, null, '  '));

      exec('git commit package.json -m "Update contributors"', done);
    });
  });
};
