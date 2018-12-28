'use strict'
const PatternUtils = require('../../../lib/utils/pattern-utils')

describe('PatternUtils.getBaseDir', () => {
  it('return parent directory without start', () => {
    expect(PatternUtils.getBaseDir('/some/path/**/more.js')).to.equal('/some/path')
    expect(PatternUtils.getBaseDir('/some/p*/file.js')).to.equal('/some')
  })

  it('remove part with !(x)', () => {
    expect(PatternUtils.getBaseDir('/some/p/!(a|b).js')).to.equal('/some/p')
    expect(PatternUtils.getBaseDir('/some/p!(c|b)*.js')).to.equal('/some')
  })

  it('remove part with +(x)', () => {
    expect(PatternUtils.getBaseDir('/some/p/+(a|b).js')).to.equal('/some/p')
    expect(PatternUtils.getBaseDir('/some/p+(c|bb).js')).to.equal('/some')
  })

  it('remove part with (x)?', () => {
    expect(PatternUtils.getBaseDir('/some/p/(a|b)?.js')).to.equal('/some/p')
    expect(PatternUtils.getBaseDir('/some/p(c|b)?.js')).to.equal('/some')
  })

  it('allow paths with parentheses', () => {
    expect(PatternUtils.getBaseDir('/some/x (a|b)/a.js')).to.equal('/some/x (a|b)/a.js')
    expect(PatternUtils.getBaseDir('/some/p(c|b)/*.js')).to.equal('/some/p(c|b)')
  })

  it('ignore exact files', () => {
    expect(PatternUtils.getBaseDir('/usr/local/bin.js')).to.equal('/usr/local/bin.js')
  })
})
