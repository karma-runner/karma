'use strict'

class BrowserResult {
  constructor () {
    this.startTime = Date.now()

    this.total = this.skipped = this.failed = this.success = 0
    this.netTime = this.totalTime = 0
    this.disconnected = this.error = false
  }

  totalTimeEnd () {
    this.totalTime = Date.now() - this.startTime
  }

  add (result) {
    if (result.skipped) {
      this.skipped++
    } else if (result.success) {
      this.success++
    } else {
      this.failed++
    }

    this.netTime += result.time
  }
}

module.exports = BrowserResult
