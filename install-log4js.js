#!/usr/bin/env node

// workaround hack for https://github.com/isaacs/npm/issues/3305

var exec = require('child_process').exec;
var version;

if (/0\.10/.test(process.versions.node)) {
  version = '0.6.2';
} else if (/0\.8/.test(process.versions.node)) {
  version = '0.5.8';
}

if (version) {
  var cp = exec('npm install log4js@' + version);

  // because stdin: 'inherit' does not work on Windows
  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);
}
