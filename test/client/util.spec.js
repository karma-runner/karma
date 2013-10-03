var util  = require('../../client/util');


describe('util', function() {

  describe('parseQueryParams', function() {
    var params = util.parseQueryParams('?id=123&return_url=http://whatever.com');

    expect(params).toEqual({id: '123', return_url: 'http://whatever.com'});
  });
});
