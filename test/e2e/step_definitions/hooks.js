const { After, Before } = require('cucumber')

Before(function () {
  this.ensureSandbox()
})

After(async function () {
  await this.proxy.stopIfRunning()

  const running = this.child != null && typeof this.child.kill === 'function'
  if (running) {
    this.child.kill()
    this.child = null
  }
})
