module.exports = function(grunt) {

  /**
   * Bump version
   *  - increase version in package.json
   *  - increase version in docs/conf.py
   *
   *
   * grunt bump
   * grunt bump:patch
   * grunt bump:minor
   * grunt bump:major
   */
  grunt.registerTask('bump', 'Increment version, generate changelog, create tag and push to github.', function(type) {

    var finish = this.async();
    // increment the version
    var PKG_FILE = 'package.json';
    var pkg = grunt.file.readJSON(PKG_FILE);
    var previousVersion = pkg.version;
    var newVersion = pkg.version = grunt.helper('bump_version', previousVersion, type);

    // write updated package.json
    grunt.file.write(PKG_FILE, JSON.stringify(pkg, null, '  '));
    grunt.log.ok('Version bumped to ' + newVersion);

    // bump version in docs
    var version = newVersion.split('.').slice(0,2).join('.');
    var release = newVersion;
    var DOCS_FILE = 'docs/conf.py';
    var docs = grunt.file.read(DOCS_FILE);
    
    var replaceVersion = function(version){
      return function(match, oldVersion){
        return match.replace(oldVersion, version);
      };
    };
    
    docs = docs.replace(/version = '([0-9\.]*)'/, replaceVersion(version));
    docs = docs.replace(/release = '([0-9\.]*)'/, replaceVersion(release));
    
    // write updated conf.py 
    grunt.file.write(DOCS_FILE, docs);
    
    grunt.log.ok('Version updated to ' + docs.match(/version = '([0-9\.]*)'/)[1]);
    grunt.log.ok('Release updated to ' + docs.match(/release = '([0-9\.]*)'/)[1]);



  });

  // TODO(vojta): update grunt.config('pkg') as well,
  // currently running grunt bump xxx (xxx still see old version)
  grunt.registerHelper('bump_version', function(version, versionType) {
    var type = {
      patch: 2,
      minor: 1,
      major: 0
    };

    var parts = version.split('.');
    var idx = type[versionType || 'patch'];

    parts[idx] = parseInt(parts[idx], 10) + 1;
    while(++idx < parts.length) {
      parts[idx] = 0;
    }
    return parts.join('.');
  });
};
