var cucumber = require('cucumber')

cucumber.defineSupportCode((a) => {
  a.After(function (scenario, callback) {
    var running = this.child != null && typeof this.child.kill === 'function'

    if (running) {
      this.child.kill()
      this.child = null
    }

    // stop the proxy if it was started
    this.proxy.stop(callback)
  })
})
