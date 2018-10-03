const log = require('../logger').create('launcher')

function RetryLauncher (retryLimit) {
  const self = this

  this._retryLimit = retryLimit

  this.on('done', function () {
    if (!self.error) {
      return
    }

    if (self._retryLimit > 0) {
      const attempt = retryLimit - self._retryLimit + 1
      log.info('Trying to start %s again (%d/%d).', self.name, attempt, retryLimit)
      self.restart()
      self._retryLimit--
    } else if (self._retryLimit === 0) {
      log.error('%s failed %d times (%s). Giving up.', self.name, retryLimit, self.error)
    } else {
      log.debug('%s failed (%s). Not restarting.', self.name, self.error)
    }
  })
}

RetryLauncher.decoratorFactory = function (retryLimit) {
  return function (launcher) {
    RetryLauncher.call(launcher, retryLimit)
  }
}

RetryLauncher.decoratorFactory.$inject = ['config.retryLimit']

module.exports = RetryLauncher
