const log = require('../logger').create('launcher')

function RetryLauncher (retryLimit) {
  this._retryLimit = retryLimit

  this.on('done', () => {
    if (!this.error) {
      return
    }

    if (this._retryLimit > 0) {
      const attempt = retryLimit - this._retryLimit + 1
      log.info('Trying to start %s again (%d/%d).', this.name, attempt, retryLimit)
      this.restart()
      this._retryLimit--
    } else if (this._retryLimit === 0) {
      log.error('%s failed %d times (%s). Giving up.', this.name, retryLimit, this.error)
    } else {
      log.debug('%s failed (%s). Not restarting.', this.name, this.error)
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
