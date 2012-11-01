//Manage notification center in osx
//Based on https://npmjs.org/package/node-osx-notifier
//Configuration sample:
// osxNotifications = {
//   notify: true,
//   host: "localhost",  //Defaults to localhost
//   port: 1337 //defaults to 1337
// };
var log = require('./logger').create('osx-notifier');
var spawn = require('child_process').spawn;
var path = require('path');
var http = require('http');
var root = path.dirname(__dirname);
var osxNotifier = {};

var TITLE = "Testacular results";

osxNotifier.spawn = function(config_osx, globalEmitter) {
    var center = spawn(path.join(root, "/node_modules/node-osx-notifier/lib/node-osx-notifier.js"), [config_osx.port, config_osx.host]);

    log.debug("Notification center started..");
    center.on('exit', function(code) {
        log.info('node-osx-notifier exited with code ' + code);
    });

    globalEmitter.on('run_complete', function(browsers, results) {
        notify(results, config_osx);
    });

};

var notify = function(results, config_osx) {
      var isFailed  = ( results.exitCode !== 0 );
      var str_request = isFailed ? 'fail' : 'pass';
      var message = "Passed: " + results.success + "\nFailed: " + results.failed;
      var uri = '/' + str_request + "?title=" + encodeURIComponent(TITLE) + "&message=" + encodeURIComponent(message);

      var options = {
        host: config_osx.host,
        port: config_osx.port,
        path: uri,
        method: 'GET'
      };

      log.debug("Sending request to osx notification center.");

      var req = http.request(options, null);

      req.on('error', function(err) {
        log.error('error: ' + err.message);
      });
      
      req.end();

    };

exports.osxNotifier = osxNotifier;