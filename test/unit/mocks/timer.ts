import {Timer} from 'timer-shim'

module.exports = function () {
  var timer = new Timer()
  timer.pause()

  return {
    setTimeout: timer.setTimeout,
    clearTimeout: timer.clearTimeout,
    setInterval: timer.setInterval,
    clearInterval: timer.clearInterval,
    wind: timer.wind
  }
}
