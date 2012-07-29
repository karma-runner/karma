var expect = chai.expect;

describe('Array', function() {

  describe('.push()', function() {

    it('should append a value', function() {
      var arr = [];

      arr.push('foo');
      arr.push('bar');

      expect(arr[0]).to.equal('foo');
      expect(arr[1]).to.equal('bar');
    });


    it('should return the length', function() {
      var i = 100;
      var some = 'x';

      while (i--) {
        some = some + 'xxx';
      }

      var arr = [];
      var n = arr.push('foo');
      expect(n).to.equal(1);

      var n = arr.push('bar');
      expect(n).to.equal(2);
    });
  });
});
