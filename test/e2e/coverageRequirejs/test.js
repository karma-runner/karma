define(['chai'], function(chai) {
  var expect = chai.expect;

  describe('something', function() {
    it('should pass', function() {
      expect(true).to.equal(true);
    });

    it('should sum', function(done) {
      require(['dependency'], function(dep) {
        expect(dep(1, 2)).to.equal(3);
        done();
      });
    });
  });
});
