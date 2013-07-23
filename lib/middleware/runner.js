/**
 * Runner middleware is reponsible for communication with `karma run`.
 *
 * It basically triggers a test run and streams stdout back.
 */

var log = require('../logger').create();
var constant = require('../constants');
var json = require('connect').json();

var createRunnerMiddleware = function(emitter, fileList, capturedBrowsers, reporter,
    /* config.hostname */ hostname, /* config.port */ port, /* config.urlRoot */ urlRoot, config) {

  return function(request, response, next) {

    if (request.url !== '/__run__' && request.url !== urlRoot + 'run') {
      return next();
    }

    log.debug('Execution (fired by runner)');
    response.writeHead(200);

    if (!capturedBrowsers.length) {
      var url = 'http://' + hostname + ':' + port + urlRoot;

      return response.end('No captured browser, open ' + url + '\n');
    }

    json(request, response, function() {
      if (!capturedBrowsers.areAllReady([])) {
        response.write('Waiting for previous execution...\n');
      }

      emitter.once('run_start', function() {
        var responseWrite = response.write.bind(response);

        reporter.addAdapter(responseWrite);

        // clean up, close runner response
        emitter.once('run_complete', function(browsers, results) {
          reporter.removeAdapter(responseWrite);
          response.end(constant.EXIT_CODE + results.exitCode);
        });
      });

      var clientArgs = request.body.args;
      log.debug('Setting client.args to ', clientArgs);
      config.client.args = clientArgs;

      log.debug('Refreshing all the files / patterns');
      fileList.refresh();
    });
  };
};


// PUBLIC API
exports.create = createRunnerMiddleware;
