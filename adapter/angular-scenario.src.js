/**
 *
 * @param {Object} tc Testacular!!
 * @param {Function} scenarioSetupAndRun angular.scenario.setUpAndRun
 * @return {Function}
 */
var createNgScenarioStartFn = function(tc, scenarioSetupAndRun) {
  /**
   * Generates Testacular Output
   */
  angular.scenario.output('testacular', function(context, runner, model) {
    registerResultListeners(model, tc);
  });

  return function(config) {
    scenarioSetupAndRun();
  };
};

var registerResultListeners = function(model, tc) {
  var totalTests = 0;

  var createFailedSpecLog = function(spec) {
    var failedStep = findFailedStep(spec.steps);
    return [
      failedStep.name,
      spec.line ? spec.line + ': ' + spec.error : spec.error
    ];
  };

  var findFailedStep = function(steps) {
    var stepCount = steps.length;
    for(var i=0; i<stepCount; i++) {
      var step = steps[i];
      if (step.status === 'failure') {
        return step;
      }
    }
    return null;
  };

  model.on('RunnerBegin', function() {
    totalTests = angular.scenario.Describe.specId;
    tc.info({total: totalTests});
  });

  model.on('SpecEnd', function(spec) {
    var result = {
      id: spec.id,
      description: spec.fullDefinitionName,
      suite: [],
      success: spec.status === 'success',
      skipped: false,
      time: spec.duration
    };
    if (spec.error) {
      result.log = createFailedSpecLog(spec);
    }
    tc.result(result);
  });

  model.on('RunnerEnd', function() {
    tc.complete();
  });
};
