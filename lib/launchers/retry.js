const log = require('../logger').create('launcher')

function RetryLauncher (retryLimit) {
  this._retryLimit = retryLimit

  this.on('done', () => {
    if (!this.error) {
      return
    }

    if (this._retryLimit > 0) {
      log.info(`Trying to start ${this.name} again (${retryLimit - this._retryLimit + 1}/${retryLimit}).`)
      this.restart()
      this._retryLimit--
    } else if (this._retryLimit === 0) {
      log.error(`${this.name} failed ${retryLimit} times (${this.error}). Giving up.`)
    } else {
      log.debug(`${this.name} failed (${this.error}). Not restarting.`)
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
