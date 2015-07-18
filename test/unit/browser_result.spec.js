describe('BrowserResult', () => {
  var Result = require('../../lib/browser_result')
  var result = null

  var successResultFromBrowser = {
    success: true,
    skipped: false,
    time: 100
  }

  var failedResultFromBrowser = {
    success: false,
    skipped: false,
    time: 200
  }

  var skippedResultFromBrowser = {
    success: false,
    skipped: true,
    time: 0
  }

  beforeEach(() => {
    sinon.stub(Date, 'now')
    Date.now.returns(123)
    result = new Result()
  })

  afterEach(() => {
    Date.now.restore()
  })

  it('should compute totalTime', () => {
    Date.now.returns(223)
    result.totalTimeEnd()
    expect(result.totalTime).to.equal(223 - 123)
  })

  it('should sum success/failed/skipped', () => {
    result.add(successResultFromBrowser)
    expect(result.success).to.equal(1)
    expect(result.failed).to.equal(0)
    expect(result.skipped).to.equal(0)

    result.add(failedResultFromBrowser)
    expect(result.success).to.equal(1)
    expect(result.failed).to.equal(1)
    expect(result.skipped).to.equal(0)

    result.add(successResultFromBrowser)
    expect(result.success).to.equal(2)
    expect(result.failed).to.equal(1)
    expect(result.skipped).to.equal(0)

    result.add(skippedResultFromBrowser)
    expect(result.success).to.equal(2)
    expect(result.failed).to.equal(1)
    expect(result.skipped).to.equal(1)
  })

  it('should sum net time of all results', () => {
    result.add(successResultFromBrowser)
    result.add(failedResultFromBrowser)
    expect(result.netTime).to.equal(300)

    result.add(successResultFromBrowser)
    expect(result.netTime).to.equal(400)
  })
})
