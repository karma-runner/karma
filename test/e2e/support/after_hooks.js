module.exports = function afterHooks () {
  this.After(function (callback) {
    var running = this.child != null && typeof this.child.kill === 'function'

    if (running) {
      this.child.kill()
      this.child = null
    }
  })
}
