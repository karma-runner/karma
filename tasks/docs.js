module.exports = function(grunt) {

  var exec = require('child_process').exec;

  /**
   * Build docs
   * 
   */
  
  grunt.registerTask('docs', 'Build the docs', function(){
    var finished = this.async();
    var cmd = 'cd docs && make html && cd ..';

    exec(cmd, function(error, output){
      if (error) {
        grunt.fail.fatal(error.message.replace(/\n$/, '.'));
      }
      else {
        grunt.log.ok('Built docs.');
        finished();
      }
    });

  });
};
