/**
 Tests for adapter/angular.src.js
 These tests are executed in browser.
 */

describe('adapter angular-scenario', function() {
  describe('Test Results Reporter', function() {
    var tc, model, passingSpec, failingSpec;
    beforeEach(function () {
      var stubRunner = {};
      stubRunner.on = function(){};
      model = new angular.scenario.ObjectModel(stubRunner);
      passingSpec = new angular.scenario.ObjectModel.Spec('passId', 'Passing', ['Full', 'Passing']);
      passingSpec.status = 'success';
      passingSpec.duration = 15;
      failingSpec = new angular.scenario.ObjectModel.Spec('failId', 'Failing', ['Full', 'Failing']);
      failingSpec.status = 'error';
      failingSpec.duration = 13;
      failingSpec.line = '12';
      failingSpec.error = 'Boooooo!!!';
      tc = new Testacular(new MockSocket(), {});

      registerResultListeners(model, tc);
    });

    it('should update number of tests as it sees them', function() {
      spyOn(tc, 'info');

      model.emit('SpecBegin');
      expect(tc.info).toHaveBeenCalledWith({total: 1});

      model.emit('SpecBegin');
      expect(tc.info).toHaveBeenCalledWith({total: 2});
    });

    it('should handle passing tests', function() {
      spyOn(tc, 'result').andCallFake(function(result) {
        expect(result.id).toEqual(passingSpec.id);
        expect(result.description).toEqual(passingSpec.fullDefinitionName);
        expect(result.suite).toEqual([]);
        expect(result.success).toBe(true);
        expect(result.skipped).toBe(false);
        expect(result.log).toBeUndefined();
        expect(result.time).toBe(passingSpec.duration);
      });

      model.emit('SpecEnd', passingSpec);
      expect(tc.result).toHaveBeenCalled();
    });
    it('should handle failing tests', function() {
      spyOn(tc, 'result').andCallFake(function(result) {
        expect(result.id).toEqual(failingSpec.id);
        expect(result.description).toEqual(failingSpec.fullDefinitionName);
        expect(result.suite).toEqual([]);
        expect(result.success).toBe(false);
        expect(result.skipped).toBe(false);
        expect(result.log).toEqual([failingSpec.line + ': ' + failingSpec.error]);
        expect(result.time).toBe(failingSpec.duration);
      });

      model.emit('SpecEnd', failingSpec);
      expect(tc.result).toHaveBeenCalled();
    });
    it('should listen for finish', function() {
      spyOn(tc, 'complete');

      model.emit('RunnerEnd');
      expect(tc.complete).toHaveBeenCalled();
    });
  });
});
