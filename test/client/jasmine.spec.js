/**
 Tests for adapter/jasmine.js
 These tests are executed in browser.
 */

describe('jasmine adapter', function() {
  describe('SimpleReporter', function() {
    var reporter, slimjim, spec;

    beforeEach(function() {
      slimjim = jasmine.createSpyObj('__slimjim__', ['result']);
      reporter = new SimpleReporter(slimjim);

      var env = new jasmine.Env();
      var parentSuite = new jasmine.Suite(env, 'parent');
      var suite = new jasmine.Suite(env, 'child', function() {}, parentSuite);
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
  });
});
