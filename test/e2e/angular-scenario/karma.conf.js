frameworks = ['ng-scenario'];

files = [
  'e2eSpec.js'
];

urlRoot = '/__testacular/';

autoWatch = true;

proxies = {
  '/': 'http://localhost:8000/test/e2e/angular-scenario/'
};

browsers = ['Chrome'];

reporters = ['dots'];

plugins = [
  'testacular-ng-scenario',
  'testacular-chrome-launcher',
  'testacular-firefox-launcher'
];

