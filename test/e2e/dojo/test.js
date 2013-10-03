define(['local/dependency','dojo/_base/lang'], function(dep,lang) {

  // jasmine
  describe('something', function() {
    it('should pass', function() {
      expect(true).toBe(true);
    });

    it('should sum', function() {
      expect(dep(1, 2)).toBe(3);
    });

    it('should trim using a dojo AMD module',function(){
       expect(lang.trim("  len4  ").length).toEqual(4);
    });

  });
});
