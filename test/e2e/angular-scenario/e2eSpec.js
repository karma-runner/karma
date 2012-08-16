
/** A Sample Angular E2E test */

describe('My Sample App', function() {

  it('should let Angular do its work', function() {
    browser().navigateTo('index.html');
    input('yourName').enter('A Pirate!');
    expect(element('.ng-binding').text()).toEqual('Hello A Pirate!!');
  });
});
