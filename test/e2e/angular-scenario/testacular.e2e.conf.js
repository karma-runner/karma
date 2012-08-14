basePath = '../../../';

files = [
  ANGULAR_SCENARIO,
  ANGULAR_SCENARIO_ADAPTER,
  'test/e2e/angular-scenario/e2eSpec.js'
];

autoWatch = true;

proxies = {
  '/': 'http://localhost:8000/test/e2e/angular-scenario/'
};
