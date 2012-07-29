var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());

exports.VERSION = pkg.version;

exports.DEFAULT_PORT = 9876;
exports.DEFAULT_RUNNER_PORT = 9100;

// log levels
exports.LOG_DISABLE = -1;
exports.LOG_ERROR   =  1;
exports.LOG_WARN    =  2;
exports.LOG_INFO    =  3;
exports.LOG_DEBUG   =  4;


exports.EXIT_CODE_0 = '\x1FEXIT0';
