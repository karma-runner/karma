var log = require('../logger').create('launcher');

/**
 * Kill browser if it does not capture in given `captureTimeout`.
 */
var CaptureTimeoutLauncher = function(timer, captureTimeout, emitter) {
  if (!captureTimeout) {
    return;
  }

  var self = this;
  var pendingTimeoutId = null;

  this.on('start', function() {
    pendingTimeoutId = timer.setTimeout(function() {
      pendingTimeoutId = null;
      if (self.state !== self.STATE_BEING_CAPTURED) {
        return;
      }

      log.warn('%s have not captured in %d ms, killing.', self.name, captureTimeout);
      self.error = 'timeout';
      self.kill().then(function() {
        emitter.emit('timeout');
      });
    }, captureTimeout);
  });

  this.on('done', function() {
    if (pendingTimeoutId) {
      timer.clearTimeout(pendingTimeoutId);
      pendingTimeoutId = null;
    }
  });
};


CaptureTimeoutLauncher.decoratorFactory = function(timer,
    /* config.captureTimeout */ captureTimeout,
    emitter) {
  return function(launcher) {
    CaptureTimeoutLauncher.call(launcher, timer, captureTimeout, emitter);
  };
};

module.exports = CaptureTimeoutLauncher;
