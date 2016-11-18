var log = require('../logger').create('launcher')

export class RetryLauncher {
  private on
  private error
  private name
  private restart
  private _retryLimit

  constructor(retryLimit) {
    this._retryLimit = retryLimit

    this.on('done', () => {
      if (!this.error) {
        return
      }

      if (this._retryLimit > 0) {
        var attempt = retryLimit - this._retryLimit + 1
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

  static decoratorFactory(retryLimit) {
    return function (launcher) {
      RetryLauncher.call(launcher, retryLimit)
    }
  }
}

RetryLauncher.decoratorFactory.$inject = ['config.retryLimit']
