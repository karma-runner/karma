import { minus } from '../minus.mjs'

describe('minus', function () {
  it('should pass', function () {
    expect(true).toBe(true)
  })

  it('should work', function () {
    expect(minus(3, 2)).toBe(1)
  })
})
