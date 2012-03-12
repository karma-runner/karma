var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json').toString());

exports.server = require('./server');
exports.runner = require('./runner');
exports.version = pkg.version;
