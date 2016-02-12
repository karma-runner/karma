var assert = require('assert')

var util = require('../../client/util')

describe('util', function () {
  it('parseQueryParams', function () {
    var params = util.parseQueryParams('?id=123&return_url=http://whatever.com')

    assert.deepEqual(params, {id: '123', return_url: 'http://whatever.com'})
  })
})
