describe('adapter requirejs', function() {
  var load, originalLoadSpy;

  beforeEach(function() {
    var files = {
      '/base/some/file.js': '12345'
    };

    originalLoadSpy = jasmine.createSpy('requirejs.load');
    load = createPatchedLoad(files, originalLoadSpy);
  });


  it('should add timestamp', function() {
    load('context', 'module', '/base/some/file.js');

    expect(originalLoadSpy).toHaveBeenCalled();
    expect(originalLoadSpy.argsForCall[0][2]).toBe('/base/some/file.js?12345');
  });


  it('should not append timestamp if not found', function() {
    load('context', 'module', '/base/other/file.js');

    expect(originalLoadSpy).toHaveBeenCalled();
    expect(originalLoadSpy.argsForCall[0][2]).toBe('/base/other/file.js');
  });


  describe('normalizePath', function() {

    it('should normalize . and .. in the path', function() {
      expect(normalizePath('/base/a/../b/./../x.js')).toBe('/base/x.js');
    });


    it('should preserve .. in the beginning of the path', function() {
      expect(normalizePath('../../a/file.js')).toBe('../../a/file.js');
    });
  });
});
