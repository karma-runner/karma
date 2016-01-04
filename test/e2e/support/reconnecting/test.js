/* globals plus */
describe('plus', function () {
  // super hacky way to get the actual socket to manipulate it...
  var socket = function () {
    return window.parent.karma.socket
  }

  it('should pass', function () {
    expect(1).toBe(1)
  })

  it('should disconnect', function (done) {
    expect(2).toBe(2)
    socket().disconnect()

    done()
  })

  it('should work', function () {
    expect(plus(1, 2)).toBe(3)
  })

  it('should re-connect', function (done) {
    expect(4).toBe(4)
    socket().connect()
    // window.parent.socket.socket.connect()

    done()
  })

  it('should work', function () {
    expect(plus(3, 2)).toBe(5)
  })
})
