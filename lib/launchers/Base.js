var spawn = require('child_process').spawn;
var path = require('path');
var log = require('../logger').create('launcher');
var fs = require('fs');
var env = process.env;


var BaseBrowser = function(id) {

  var exitCallback = function() {};

  this.id = id;
  this.isCaptured = false;

  this._tempDir = path.normalize((env.TMPDIR || env.TMP || env.TEMP || '/tmp') + '/testacular-' +
      id.toString());

  try {
    log.debug('Creating temp dir at ' + this._tempDir);
    fs.mkdirSync(this._tempDir);
  } catch (e) {}


  this.start = function(url) {
    this._execCommand(this._getCommand(), this._getOptions(url));
  };


  this.kill = function(callback) {
    exitCallback = callback || function() {};

    if (this._process.exitCode === null) {
      this._process.kill();
    } else {
      process.nextTick(exitCallback);
    }
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
