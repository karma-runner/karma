const assert = require('assert')
const util = require('../../common/util')

describe('util', function () {
  it('parseQueryParams', function () {
    const params = util.parseQueryParams('?id=123&return_url=http://whatever.com')

    assert.deepEqual(params, {id: '123', return_url: 'http://whatever.com'})
  })
})
