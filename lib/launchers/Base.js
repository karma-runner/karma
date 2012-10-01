var spawn = require('child_process').spawn;
var path = require('path');
var log = require('../logger').create('launcher');
var fs = require('fs');
var env = process.env;

var BEING_CAPTURED = 1;
var CAPTURED = 2;
var BEING_KILLED = 3;
var FINISHED = 4;
var BEING_TIMEOUTED = 5;

var BaseBrowser = function(id, emitter) {

  var exitCallback = function() {};

  this.id = id;
  this.status = null;

  this._tempDir = path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/testacular-' +
      id.toString());

  try {
    log.debug('Creating temp dir at ' + this._tempDir);
    fs.mkdirSync(this._tempDir);
  } catch (e) {}


  this.start = function(url) {
    this._execCommand(this._getCommand(), this._getOptions(url));
    this.status = BEING_CAPTURED;
  };


  this.markCaptured = function() {
    this.status = CAPTURED;
  };


  this.isCaptured = function() {
    return this.status === CAPTURED;
  };


  this.kill = function(callback) {
    exitCallback = callback || function() {};

    if (this.status !== FINISHED) {
      this.status = BEING_KILLED;
      this._process.kill();
    } else {
      process.nextTick(exitCallback);
    }
  };


  this.timeout = function() {
    this.status = BEING_TIMEOUTED;
    this._process.kill();
  };


  this.toString = function() {
    return this.name;
  };


  this._getCommand = function() {
    var cmd = path.normalize(env[this.ENV_CMD] || this.DEFAULT_CMD[process.platform]);

    if (!cmd) {
      log.error('No binary for "%s" browser on your platform.\n\t' +
          'Please, set "%s" env variable.', this.name, this.ENV_CMD);
    }

    return cmd;
  };


  this._execCommand = function(cmd, args) {
    log.debug(cmd + ' ' + args.join(' '));
    this._process = spawn(cmd, args);

    var errorOutput = '';
    this._process.stderr.on('data', function(data) {
      errorOutput += data.toString();
    });

    var self = this;
    this._process.on('exit', function(code) {
      if (code) {
        log.error('Cannot start %s\n\t%s', self.name, errorOutput);
      }

      if (self.status === BEING_CAPTURED || self.status === BEING_TIMEOUTED) {
        emitter.emit('browser_process_failure', self);
      }

      self.status = FINISHED;

      log.debug('Cleaning %s', self._tempDir);
      spawn('rm', ['-rf', self._tempDir]).on('exit', exitCallback);
    });
  };


  this._getOptions = function(url) {
    return [url];
  };
};


// PUBLISH
module.exports = BaseBrowser;
