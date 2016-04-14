// Override the Karma setup for local debugging
window.__karma__.info = function (info) {
  if (info.dump && window.console) window.console.log(info.dump)
}
window.__karma__.complete = function () {
  if (window.console) window.console.log('Skipped ' + this.skipped + ' tests')
}
window.__karma__.skipped = 0
window.__karma__.result = window.console ? function (result) {
  if (result.skipped) {
    this.skipped++
    return
  }
  var msg = result.success ? 'SUCCESS ' : 'FAILED '
  window.console.log(msg + result.suite.join(' ') + ' ' + result.description)

  for (var i = 0; i < result.log.length; i++) {
    // Throwing error without losing stack trace
    (function (err) {
      setTimeout(function () {
        throw err
      })
    })(result.log[i])
  }
} : function () {}
window.__karma__.loaded = function () {
  this.start()
}
