const cucumber = require('cucumber')

cucumber.defineSupportCode((a) => {
  a.After(function (scenario, callback) {
    const running = this.child != null && typeof this.child.kill === 'function'

    // stop the proxy if it was started
    this.proxy.stop(() => {
      if (running) {
        this.child.kill()
        this.child = null
      }
      callback()
    })
  })
})
