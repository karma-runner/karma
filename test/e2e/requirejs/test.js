define(['dependency'], function(dep) {

  // jasmine
  describe('something', function() {
    it('should pass', function() {
      expect(true).toBe(true);
    });

    it('should sum', function() {
      expect(dep(1, 2)).toBe(3);
    });
  });
});
