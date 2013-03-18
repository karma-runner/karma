files = [
  ANGULAR_SCENARIO,
  ANGULAR_SCENARIO_ADAPTER,
  'e2eSpec.js'
];

urlRoot = '/__testacular/';

autoWatch = true;

proxies = {
  '/': 'http://localhost:8000/test/e2e/angular-scenario/'
};

reporters = ['dots'];