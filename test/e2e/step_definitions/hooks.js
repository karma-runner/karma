const { After } = require('cucumber')

After(async function () {
  await this.proxy.stopIfRunning()

  const running = this.child != null && typeof this.child.kill === 'function'
  if (running) {
    this.child.kill()
    this.child = null
  }
})
