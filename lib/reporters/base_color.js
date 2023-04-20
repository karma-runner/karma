const { red, yellow, green, cyan } = require('@colors/colors/safe')

function BaseColorReporter () {
  this.USE_COLORS = true

  this.LOG_SINGLE_BROWSER = '%s: ' + cyan('%s') + '\n'
  this.LOG_MULTI_BROWSER = '%s %s: ' + cyan('%s') + '\n'

  this.SPEC_FAILURE = red('%s %s FAILED') + '\n'
  this.SPEC_SLOW = yellow('%s SLOW %s: %s') + '\n'
  this.ERROR = red('%s ERROR') + '\n'

  this.FINISHED_ERROR = red(' ERROR')
  this.FINISHED_SUCCESS = green(' SUCCESS')
  this.FINISHED_DISCONNECTED = red(' DISCONNECTED')

  this.X_FAILED = red(' (%d FAILED)')

  this.TOTAL_SUCCESS = green('TOTAL: %d SUCCESS') + '\n'
  this.TOTAL_FAILED = red('TOTAL: %d FAILED, %d SUCCESS') + '\n'
}

// PUBLISH
module.exports = BaseColorReporter
