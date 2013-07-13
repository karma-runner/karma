describe('template', function() {
  it('should expose the templates to __html__', function() {
    document.body.innerHTML = __html__['template.html'];
    expect(document.getElementById('tpl')).toBeDefined();
  })
})
