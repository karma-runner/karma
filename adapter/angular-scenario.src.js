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
  model.on('SpecBegin', function(spec) {
    totalTests++;
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
      var errorMsg = spec.line ? spec.line + ': ' + spec.error : spec.error;
      result.log = [errorMsg];
    }
    tc.result(result);
  });

  model.on('RunnerEnd', function() {
    tc.complete();
  });
};
