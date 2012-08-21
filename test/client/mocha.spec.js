/**
 Tests for adapter/mocha.src.js
 These tests are executed in browser.
 */

describe('adapter mocha', function() {
  describe('reporter', function() {
    var runner, tc;

    beforeEach(function() {
      tc = new Testacular(new MockSocket(), {});
      runner = new Emitter();
      reporter = new (createMochaReporterConstructor(tc))(runner);
    });


    describe('start', function() {

      it('should report total number of specs', function() {
        runner.total = 12;
        spyOn(tc, 'info');

        runner.emit('start');
        expect(tc.info).toHaveBeenCalledWith({total: 12});
      });
    });


    describe('end', function() {

      it('should report complete', function() {
        spyOn(tc, 'complete');

        runner.emit('end');
        expect(tc.complete).toHaveBeenCalled();
      });
    });


    describe('test end', function() {

      it('should report result', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.id).toBeDefined();
          expect(result.description).toBe('should do something');
          expect(result.suite instanceof Array).toBe(true);
          expect(result.success).toBe(true);
          expect(result.skipped).toBe(false);
          expect(result.log instanceof Array).toBe(true);
          expect(result.time).toBe(123);
        });

        var mockMochaResult = {
          duration: 123,
          parent: {title: 'desc2', parent: {title: 'desc1', root: true}, root: false},
          state: "passed",
          title: 'should do something'
        };

        runner.emit('test', mockMochaResult);
        runner.emit('test end', mockMochaResult);

        expect(tc.result).toHaveBeenCalled();
      });


      it('should report failed result', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.success).toBe(false);
          expect(result.skipped).toBe(false);
          expect(result.log).toEqual(['Big trouble.', 'Another fail.']);
        });

        var mockMochaResult = {
          parent: {title: 'desc2', root: true},
          state: "failed",
          title: 'should do something'
        };

        runner.emit('test', mockMochaResult);
        runner.emit('fail', mockMochaResult, {message: 'Big trouble.'});
        runner.emit('pass', mockMochaResult);
        runner.emit('fail', mockMochaResult, {message: 'Another fail.'});
        runner.emit('test end', mockMochaResult);

        expect(tc.result).toHaveBeenCalled();
      });


      it('should report suites', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.suite).toEqual(['desc1', 'desc2']);
        });

        var mockMochaResult = {
          parent: {title: 'desc2', parent: {title: 'desc1', parent: {root: true}, root: false}, root: false},
          title: 'should do something',
        };

        runner.emit('test', mockMochaResult);
        runner.emit('test end', mockMochaResult);

        expect(tc.result).toHaveBeenCalled();
      });
    });

    describe('fail', function() {
      it('should end test on hook failure', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.success).toBe(false);
          expect(result.skipped).toBe(false);
          expect(result.log).toEqual(['hook failed']);
        });

        var mockMochaHook = {
          type: 'hook',
          title: 'scenario "before each" hook',
          parent: {title: 'desc1', root: true}
        };

        runner.emit('hook', mockMochaHook);
        runner.emit('fail', mockMochaHook, {message: 'hook failed'});

        expect(tc.result).toHaveBeenCalled();
      })
    })
  });
});
