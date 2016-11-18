export class Result {
  skipped = 0
  failed = 0
  success = 0
  totalTime = 0
  error = false
  total = 0
  netTime = 0
  disconnected = false

  private startTime = Date.now()

  constructor() {
  }

  totalTimeEnd() {
    this.totalTime = Date.now() - this.startTime
  }

  add(result) {
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
