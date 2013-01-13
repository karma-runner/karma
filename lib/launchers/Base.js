var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var log = require('../logger').create('launcher');
var env = process.env;

var BEING_CAPTURED = 1;
var CAPTURED = 2;
var BEING_KILLED = 3;
var FINISHED = 4;
var BEING_TIMEOUTED = 5;


var BaseBrowser = function(id, emitter, captureTimeout, retryLimit) {

  var self = this;
  var capturingUrl;
  var exitCallback = function() {};

  this.id = id;
  this.state = null;
  this._tempDir = path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/testacular-' +
      id.toString());


  this.start = function(url) {
    capturingUrl = url;

    try {
      log.debug('Creating temp dir at ' + self._tempDir);
      fs.mkdirSync(self._tempDir);
    } catch (e) {}

    self._start(capturingUrl + '?id=' + self.id);
    self.state = BEING_CAPTURED;

    if (captureTimeout) {
      setTimeout(self._onTimeout, captureTimeout);
    }
  };


  this._start = function(url) {
    self._execCommand(self._getCommand(), self._getOptions(url));
  };


  this.markCaptured = function() {
    self.state = CAPTURED;
  };


  this.isCaptured = function() {
    return self.state === CAPTURED;
  };


  this.kill = function(callback) {
    exitCallback = callback || function() {};

    log.debug('Killing %s', self.name);

    if (self.state !== FINISHED) {
      self.state = BEING_KILLED;
      self._process.kill();
    } else {
      process.nextTick(exitCallback);
    }
  };


  this._onTimeout = function() {
    if (self.state !== BEING_CAPTURED) {
      return;
    }

    log.warn('%s have not captured in %d ms, killing.', self.name, captureTimeout);

    self.state = BEING_TIMEOUTED;
    self._process.kill();
  };


  this.toString = function() {
    return self.name;
  };


  this._getCommand = function() {
    var cmd = path.normalize(env[self.ENV_CMD] || self.DEFAULT_CMD[process.platform]);

    if (!cmd) {
      log.error('No binary for %s browser on your platform.\n\t' +
          'Please, set "%s" env variable.', self.name, self.ENV_CMD);
    }

    return cmd;
  };


  this._execCommand = function(cmd, args) {
    log.debug(cmd + ' ' + args.join(' '));
    self._process = spawn(cmd, args);

    var errorOutput = '';
    self._process.stderr.on('data', function(data) {
      errorOutput += data.toString();
    });

    self._process.on('close', function(code) {
      self._onProcessExit(code, errorOutput);
    });
  };


  this._onProcessExit = function(code, errorOutput) {
    log.debug('Process %s exitted with code %d', self.name, code);

    if (code) {
      log.error('Cannot start %s\n\t%s', self.name, errorOutput);
    }

    retryLimit--;

    if (self.state === BEING_CAPTURED || self.state === BEING_TIMEOUTED) {
      if (retryLimit > 0) {
        return self._cleanUpTmp(function() {
          log.info('Trying to start %s again.', self.name);
          self.start(capturingUrl);
        });
      } else {
        emitter.emit('browser_process_failure', self);
      }
    }

    self.state = FINISHED;
    self._cleanUpTmp(exitCallback);
  };


  this._cleanUpTmp = function(done) {
    log.debug('Cleaning temp dir %s', self._tempDir);
    rimraf(self._tempDir, done);
  };


  this._getOptions = function(url) {
    return [url];
  };
};


// PUBLISH
module.exports = BaseBrowser;
