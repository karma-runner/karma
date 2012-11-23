/**
 Tests for adapter/qunit.src.js
 These tests are executed in browser.
 */

describe('adapter qunit', function() {
  describe('reporter', function() {
    var runner, tc;

    beforeEach(function() {
      tc = new Testacular(new MockSocket(), {});
      runner = new Emitter();
      window.QUnit = runner;
      reporter = new (createQUnitStartFn(tc))();
    });


    describe('done', function() {

      it('should report complete', function() {
        spyOn(tc, 'complete');

        runner.emit('done');
        expect(tc.complete).toHaveBeenCalled();
      });
    });


    describe('test end', function() {

      it('should report result', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.description).toBe('should do something');
          expect(result.suite instanceof Array).toBe(true);
          expect(result.success).toBe(true);
          expect(result.log instanceof Array).toBe(true);
        });

        var mockQUnitResult = {
          name: 'should do something',
          module: 'desc1',
          failed: 0
        };

        runner.emit('testStart', mockQUnitResult);
        runner.emit('testDone', mockQUnitResult);

        expect(tc.result).toHaveBeenCalled();
      });
      
      it('should report failed result', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.success).toBe(false);
          expect(result.log).toEqual(['Big trouble.']);
        });

        var mockQUnitResult = {
          module: 'desc1',
          failed: 1,
          name: 'should do something'
        };
        
        var mockQUnitLog = {
          result: false,
          message: 'Big trouble.',
        };

        runner.emit('testStart', mockQUnitResult);
        runner.emit('log', mockQUnitLog);
        runner.emit('testDone', mockQUnitResult);

        expect(tc.result).toHaveBeenCalled();
      });
    });
  });
});
