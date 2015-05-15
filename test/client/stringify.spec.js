var chai = require('chai');
var expect = chai.expect

var stringify = require('../../client/stringify');

describe('stringify', function() {
  it('should serialize string', function() {
    expect(stringify('aaa')).to.be.eql("'aaa'");
  });


  it('should serialize booleans', function() {
    expect(stringify(true)).to.be.eql('true');
    expect(stringify(false)).to.be.eql('false');
  });


  it('should serialize null and undefined', function() {
    expect(stringify(null)).to.be.eql('null');
    expect(stringify()).to.be.eql('undefined');
  });


  it('should serialize functions', function() {
    function abc(a, b, c) { return 'whatever'; }
    var def = function(d, e, f) { return 'whatever'; };

    expect(stringify(abc)).to.be.eql('function abc(a, b, c) { ... }');
    expect(stringify(def)).to.be.eql('function (d, e, f) { ... }');
  });


  it('should serialize arrays', function() {
    expect(stringify(['a', 'b', null, true, false])).to.be.eql("['a', 'b', null, true, false]");
  });

  it('should serialize objects', function () {
    var obj;


    obj = {a: 'a', b: 'b', c: null, d: true, e: false};
    expect(stringify(obj)).to.be.eql('Object{a: \'a\', b: \'b\', c: null, d: true, e: false}');

    function MyObj() {
      this.a = 'a';
    }

    obj = new MyObj();
    expect(stringify(obj)).to.be.eql('MyObj{a: \'a\'}');

    obj = {constructor: null};
    expect(stringify(obj)).to.be.eql('Object{constructor: null}');

    obj = Object.create(null);
    obj.a = 'a';
    expect(stringify(obj)).to.be.eql('Object{a: \'a\'}');
  });


  it('should serialize html', function() {
    var div = document.createElement('div');

    expect(stringify(div)).to.be.eql('<div></div>');

    div.innerHTML = 'some <span>text</span>';
    expect(stringify(div)).to.be.eql('<div>some <span>text</span></div>');
  });


  it('should serialize across iframes', function() {
    var div = document.createElement('div');
    expect(__karma__.stringify(div)).to.be.eql('<div></div>');

    expect(__karma__.stringify([1, 2])).to.be.eql('[1, 2]');
  });
});
