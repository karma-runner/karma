import { minus } from '../minus.mjs'

describe('minus', function () {
  it('should pass', function () {
    expect(true).to.be.true
  })

  it('should work', function () {
    expect(minus(3, 2)).to.equal(1)
  })
})
