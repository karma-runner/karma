/**
 Tests for adapter/jasmine.js
 These tests are executed in browser.
 */

describe('jasmine adapter', function() {
  describe('SimpleReporter', function() {
    var reporter, slimjim, failedIds, env, suite, spec;

    beforeEach(function() {
      slimjim = jasmine.createSpyObj('__slimjim__', ['result']);
      failedIds = [];
      reporter = new SimpleReporter(slimjim, failedIds);

      env = new jasmine.Env();
      var parentSuite = new jasmine.Suite(env, 'parent');
      suite = new jasmine.Suite(env, 'child', function() {}, parentSuite);
      spec = new jasmine.Spec(env, suite, 'should test');
    });


    it('should report success result', function() {
      slimjim.result.andCallFake(function(result) {
        expect(result.id).toBe(spec.id);
        expect(result.description).toBe('should test');
        expect(result.suite).toEqual(['parent', 'child']);
        expect(result.success).toBe(true);
      });

      reporter.reportSpecResults(spec);
      expect(slimjim.result).toHaveBeenCalled();
    });


    it('should report fail result', function() {
      spec.fail(new Error('whatever'));

      slimjim.result.andCallFake(function(result) {
        expect(result.success).toBe(false);
        expect(result.log.length).toBe(1);
      });

      reporter.reportSpecResults(spec);
      expect(slimjim.result).toHaveBeenCalled();
    });


    it('should report failed ids', function() {
      var specs = [                                  // id
        spec,                                        // 0
        new jasmine.Spec(env, suite, 'should test'), // 1
        new jasmine.Spec(env, suite, 'should test'), // 2
        new jasmine.Spec(env, suite, 'should test')  // 3
      ];

      specs[1].fail(new Error('Some error'));
      specs[2].fail(new Error('Another error'));

      while(specs.length) {
        reporter.reportSpecResults(specs.shift());
      }

      expect(failedIds).toEqual([1, 2]);
    });


    it('should remove jasmine-specific frames from the exception stack traces', function() {
      var error = new Error('my custom');
      error.stack = "Error: Expected 'function' to be 'fxunction'.\n"+
        "    at new <anonymous> (http://localhost:8080/lib/jasmine/jasmine.js:102:32)\n"+
        "    at [object Object].toBe (http://localhost:8080/lib/jasmine/jasmine.js:1171:29)\n"+
        "    at [object Object].<anonymous> (http://localhost:8080/test/resourceSpec.js:2:3)\n"+
        "    at [object Object].execute (http://localhost:8080/lib/jasmine/jasmine.js:1001:15)";

      spec.fail(error);

      slimjim.result.andCallFake(function(result) {
        expect(result.log).toEqual([
          "Error: Expected 'function' to be 'fxunction'.\n"+
            "    at [object Object].<anonymous> (http://localhost:8080/test/resourceSpec.js:2:3)"
        ]);
      });

      reporter.reportSpecResults(spec);
      expect(slimjim.result).toHaveBeenCalled();
    });


    it('should report message if no stack trace', function() {
      var error = new Error('Expected fail!');
      error.stack = undefined;

      spec.fail(error);

      slimjim.result.andCallFake(function(result) {
        expect(result.success).toBe(false);
        expect(result.log).toEqual(['Error: Expected fail!']);
      });

      reporter.reportSpecResults(spec);
      expect(slimjim.result).toHaveBeenCalled();
    });
  });


  describe('startFn', function() {
    var sj, jasmineEnv, start;

    beforeEach(function() {
      sj = {
        jasmineLastResults: {
          failedIds: [1, 3, 5],
          count: 10
        },
        info: function() {},
        complete: function() {},
        result: function() {}
      };
      jasmineEnv = new jasmine.Env();
      start = createStartFn(sj, jasmineEnv);
    });


    it('should reset last results', function() {
      start();
      expect(sj.jasmineLastResults).toEqual({
        failedIds: [],
        count: 0
      });
    });


    it('should store failed ids', function() {
      jasmineEnv.describe('fake', function() {
        jasmineEnv.it('should pass', function() {});
        jasmineEnv.it('should fail', function() {throw new Error('FAIL');});
      });

      start();

      waitsFor(function() {
        return sj.jasmineLastResults.failedIds.length;
      }, 'execution finish', 50);

      runs(function() {
        expect(sj.jasmineLastResults.failedIds).toEqual([1]);
      });
    });


    describe('specFilter', function() {
      var originalSpecFilter = 'ORIGINAL SPEC FILTER';

      beforeEach(function() {
        jasmineEnv.specFilter = originalSpecFilter;
      });


      it('should filter only last failed', function() {
        sj.jasmineLastResults.failedIds = [1, 3, 5];
        sj.jasmineLastResults.count = 5;
        jasmineEnv.nextSpecId_ = 5;

        start();
        expect(jasmineEnv.specFilter({id: 1})).toBe(true);
        expect(jasmineEnv.specFilter({id: 2})).toBe(false);
        expect(jasmineEnv.specFilter({id: 3})).toBe(true);
        expect(jasmineEnv.specFilter({id: 4})).toBe(false);
        expect(jasmineEnv.specFilter({id: 5})).toBe(true);
      });


      it('should not filter if first run', function() {
        sj.jasmineLastResults = undefined;

        start();
        expect(jasmineEnv.specFilter).toBe(originalSpecFilter);
      });


      it('should not filter if number of specs changed', function() {
        sj.jasmineLastResults.count = 10;
        jasmineEnv.nextSpecId_ = 5;

        start();
        expect(jasmineEnv.specFilter).toBe(originalSpecFilter);
      });


      it('should not filter if all specs passed last time', function() {
        sj.jasmineLastResults.failedIds = [];
        sj.jasmineLastResults.count = 5;
        jasmineEnv.nextSpecId_ = 5;

        start();
        expect(jasmineEnv.specFilter).toBe(originalSpecFilter);
      });


      it('should not filter if exclusive mode', function() {
        sj.jasmineLastResults.failedIds = [1, 3, 5];
        sj.jasmineLastResults.count = 5;
        jasmineEnv.nextSpecId_ = 5;
        jasmineEnv.exclusive_ = 1;

        start();
        expect(jasmineEnv.specFilter).toBe(originalSpecFilter);
      });
    });
  });
});
