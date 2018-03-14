/* globals containsJsTag, isFirefoxBefore59 */
describe('JavaScript version tag', function () {
  it('should add the version tag, if Firefox is used', function () {
    expect(containsJsTag()).toBe(isFirefoxBefore59())
  })
})
