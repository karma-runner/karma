/* globals plus */
describe('plus', function () {
  // super hacky way to get the actual socket to manipulate it...
  function socket () {
    return window.parent.karma.socket
  }

  it('should pass', function () {
    // In flaky fails we probably get two starts.
    console.log('============== START TEST ==============')
    expect(1).toBe(1)
  })

  it('should disconnect', function (done) {
    expect(2).toBe(2)
    setTimeout(() => {
      socket().disconnect()
      done()
    }, 500)
  })

  it('should work', function () {
    expect(plus(1, 2)).toBe(3)
  })

  it('should re-connect', function () {
    expect(4).toBe(4)
    socket().connect()
  })

  it('should work', function () {
    expect(plus(3, 2)).toBe(5)
  })
})
