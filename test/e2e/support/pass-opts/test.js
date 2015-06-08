describe('config', function () {
  it('should be passed through to the browser', function () {
    expect(window.__karma__.config).toBeDefined()
    expect(window.__karma__.config.args).toEqual(['arg1', 'arg2'])
  })
})
