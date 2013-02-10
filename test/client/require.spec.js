describe('adapter requirejs', function() {

  describe('normalizePath', function() {

    it('should normalize . and .. in the path', function() {
      expect(normalizePath('/base/a/../b/./../x.js')).toBe('/base/x.js');
    });


    it('should preserve .. in the beginning of the path', function() {
      expect(normalizePath('../../a/file.js')).toBe('../../a/file.js');
    });
  });
});
