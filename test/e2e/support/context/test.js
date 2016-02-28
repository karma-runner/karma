describe('custom context file', function () {
  it('should be able to find custom DOM elements', function () {
    expect(document.querySelector('#custom-context') == null).toBe(false)
  })
})
