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
      //hack to mock QUnit config singleton
      runner.config = {current: {assertions: []}}
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

        var mockMochaResult = {
          name: 'should do something',
          module: 'desc1',
          failed: 0
        };

        runner.emit('testStart', mockMochaResult);
        runner.emit('testDone', mockMochaResult);

        expect(tc.result).toHaveBeenCalled();
      });
      
      it('should report failed result', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.success).toBe(false);
          expect(result.log).toEqual(['Big trouble.']);
        });

        window.QUnit.config.current.assertions = [{ message : '<span><pre>Big trouble.</pre></span>'}];
        var mockMochaResult = {
          module: 'desc1',
          failed: 1,
          name: 'should do something'
        };

        runner.emit('testStart', mockMochaResult);
        runner.emit('testDone', mockMochaResult);

        expect(tc.result).toHaveBeenCalled();
        window.QUnit.config.current.assertions = [];
      });
    });
  });
});
