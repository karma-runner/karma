/* globals containsJsTag */
describe('JavaScript version tag', function () {
  it('should not add the version tag for every browser', function () {
    expect(containsJsTag()).toBe(false)
  })
})
