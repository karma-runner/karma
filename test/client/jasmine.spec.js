/**
 Tests for adapter/jasmine.js
 These tests are executed in browser.
 */

describe('jasmine adapter', function() {
  describe('TestacularReporter', function() {
    var reporter, testacular, failedIds, env, suite, spec;

    beforeEach(function() {
      testacular = new Testacular(new MockSocket(), {});
      reporter = new TestacularReporter(testacular);
      spyOn(testacular, 'result');

      env = new jasmine.Env();
      var parentSuite = new jasmine.Suite(env, 'parent');
      suite = new jasmine.Suite(env, 'child', function() {}, parentSuite);
      spec = new jasmine.Spec(env, suite, 'should test');
    });


    it('should report success result', function() {
      testacular.result.andCallFake(function(result) {
        expect(result.id).toBe(spec.id);
        expect(result.description).toBe('should test');
        expect(result.suite).toEqual(['parent', 'child']);
        expect(result.success).toBe(true);
        expect(result.skipped).toBe(false);
      });

      reporter.reportSpecResults(spec);
      expect(testacular.result).toHaveBeenCalled();
    });


    it('should report fail result', function() {
      spec.fail(new Error('whatever'));

      testacular.result.andCallFake(function(result) {
        expect(result.success).toBe(false);
        expect(result.log.length).toBe(1);
      });

      reporter.reportSpecResults(spec);
      expect(testacular.result).toHaveBeenCalled();
    });


    it('should remove jasmine-specific frames from the exception stack traces', function() {
      var error = new Error("Expected 'function' to be 'fxunction'");
      error.stack = "Error: Expected 'function' to be 'fxunction'.\n" +
        "    at new <anonymous> (http://localhost:8080/lib/jasmine/jasmine.js?123412234:102:32)\n" +
        "    at [object Object].toBe (http://localhost:8080/lib/jasmine/jasmine.js?123:1171:29)\n" +
        "    at [object Object].<anonymous> (http://localhost:8080/test/resourceSpec.js:2:3)\n" +
        "    at [object Object].execute (http://localhost:8080/lib/jasmine/jasmine.js?123:1001:15)";

      spec.fail(error);

      testacular.result.andCallFake(function(result) {
        expect(result.log).toEqual([
          "Error: Expected 'function' to be 'fxunction'.\n"+
            "    at [object Object].<anonymous> (http://localhost:8080/test/resourceSpec.js:2:3)"
        ]);
      });

      reporter.reportSpecResults(spec);
      expect(testacular.result).toHaveBeenCalled();
    });


    it('should report time for every spec', function() {
      var counter = 3;
      spyOn(Date.prototype, 'getTime').andCallFake(function() {
        return counter++;
      });

      testacular.result.andCallFake(function(result) {
        expect(result.time).toBe(1); // 4 - 3
      });

      reporter.reportSpecStarting(spec);
      reporter.reportSpecResults(spec);

      expect(testacular.result).toHaveBeenCalled();
    });
  });


  describe('formatFailedStep', function() {

    it('should prepend the stack with message if browser does not', function() {
      // FF does not have the message in the stack trace
      expect(formatFailedStep(new jasmine.ExpectationResult({
        passed: false,
        message: 'Jasmine fail message',
        trace: {
          stack: '@file.js:123\n'
        }
      }))).toMatch(/^Jasmine fail message/);
    });

    it('should report message if no stack trace', function() {
      // Safari does not have trace
      expect(formatFailedStep(new jasmine.ExpectationResult({
        passed: false,
        message: 'MESSAGE',
        trace: {
          stack: undefined
        }
      }))).toBe('MESSAGE');
    });

    it('should remove jasmine-specific frames from the exception stack traces', function() {
      expect(formatFailedStep(new jasmine.ExpectationResult({
        passed: false,
        message: "Error: Expected 'function' to be 'fxunction'",
        trace: {
          stack: "Error: Expected 'function' to be 'fxunction'.\n" +
                 "    at new <anonymous> (http://localhost:8080/lib/jasmine/jasmine.js?123412234:102:32)\n" +
                 "    at [object Object].toBe (http://localhost:8080/lib/jasmine/jasmine.js?123:1171:29)\n" +
                 "    at [object Object].<anonymous> (http://localhost:8080/test/resourceSpec.js:2:3)\n" +
                 "    at [object Object].execute (http://localhost:8080/lib/jasmine/jasmine.js?123:1001:15)"
        }
      }))).toBe(
        "Error: Expected 'function' to be 'fxunction'.\n" +
        "    at [object Object].<anonymous> (http://localhost:8080/test/resourceSpec.js:2:3)"
      );
    });
  });


  describe('startFn', function() {
    var tc, jasmineEnv, start;

    beforeEach(function() {
      tc = new Testacular(new MockSocket(), {});

      spyOn(tc, 'info');
      spyOn(tc, 'complete');
      spyOn(tc, 'result');

      jasmineEnv = new jasmine.Env();
      start = createStartFn(tc, jasmineEnv);
    });
  });


  describe('createDumpFn', function() {
    var dump, testacular;

    beforeEach(function() {
      testacular = jasmine.createSpyObj('__testacular__', ['info']);
    });


    it('should serialize and call info', function() {
      dump = createDumpFn(testacular, function(value) {
        return value + 'x';
      });

      dump(1, 'a');
      expect(testacular.info).toHaveBeenCalledWith({dump: ['1x', 'ax']});
    });


    it('should allow no serialize', function() {
      dump = createDumpFn(testacular);

      dump(1, 'a');
      expect(testacular.info).toHaveBeenCalledWith({dump: [1, 'a']});
    });
  });


  describe('indexOf', function() {
    it('should return index of given item', function() {
      var collection = [{}, {}, {}];
      collection.indexOf = null; // so that we can test it even on

      expect(indexOf(collection, {})).toBe(-1);
      expect(indexOf(collection, collection[1])).toBe(1);
      expect(indexOf(collection, collection[2])).toBe(2);
    });
  });
});
