'use strict'

const JsonUtils = require('../../../lib/utils/json-utils')

describe('json-utils', () => {
  it('stringify-s', () => {
    const obj = { a: 'a', i: 1 }
    const json = JsonUtils.stringify(obj)
    expect(json).to.be.equal('[{"a":"1","i":1},"a"]')
  })
  it('stringify-s circular data', () => {
    const a = [{}]
    a[0].a = a
    a.push(a)

    expect(JsonUtils.stringify(a)).to.be.equal('[["1","0"],{"a":"0"}]')
  })
})
