// Shared configuration for Cucumber.js tests.
// See https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md#profiles
const options = [
  '--format progress',
  '--require test/e2e/support/env.js',
  '--require test/e2e/support/world.js',
  '--require test/e2e/step_definitions/core_steps.js',
  '--require test/e2e/step_definitions/hooks.js'
]

module.exports = {
  'default': options.join(' ')
}
