/** A Sample Angular E2E test */

describe('My Sample App', function() {

  it('should let Angular do its work', function() {
    browser().navigateTo('/index.html');
    input('yourName').enter('A Pirate!');
    expect(element('.ng-binding').text()).toEqual('Hello A Pirate!!');
  });

  xit('should skip this e2e test', function() {
    sleep(15);
    browser().navigateTo('/index.html');
  });
});
