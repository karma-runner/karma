const Timer = require('timer-shim').Timer

module.exports = function () {
  const timer = new Timer()
  timer.pause()

  return {
    setTimeout: timer.setTimeout,
    clearTimeout: timer.clearTimeout,
    setInterval: timer.setInterval,
    clearInterval: timer.clearInterval,
    wind: timer.wind
  }
}
