var stringify = require('../../client/stringify');


describe('stringify', function() {
  it('should serialize string', function() {
    expect(stringify('aaa')).toBe("'aaa'");
  });


  it('should serialize booleans', function() {
    expect(stringify(true)).toBe('true');
    expect(stringify(false)).toBe('false');
  });


  it('should serialize null and undefined', function() {
    expect(stringify(null)).toBe('null');
    expect(stringify()).toBe('undefined');
  });


  it('should serialize functions', function() {
    function abc(a, b, c) { return 'whatever'; }
    var def = function(d, e, f) { return 'whatever'; };

    expect(stringify(abc)).toBe('function abc(a, b, c) { ... }');
    expect(stringify(def)).toBe('function (d, e, f) { ... }');
  });


  it('should serialize arrays', function() {
    expect(stringify(['a', 'b', null, true, false])).toBe("['a', 'b', null, true, false]");
  });

  it('should serialize objects', function () {
    var obj;


    obj = {a: 'a', b: 'b', c: null, d: true, e: false};
    expect(stringify(obj)).toBe('Object{a: \'a\', b: \'b\', c: null, d: true, e: false}');

    function MyObj() {
      this.a = 'a';
    }

    obj = new MyObj();
    expect(stringify(obj)).toBe('MyObj{a: \'a\'}');

    obj = {constructor: null};
    expect(stringify(obj)).toBe('Object{constructor: null}');

    obj = Object.create(null);
    obj.a = 'a';
    expect(stringify(obj)).toBe('Object{a: \'a\'}');
  });


  it('should serialize html', function() {
    var div = document.createElement('div');

    expect(stringify(div)).toBe('<div></div>');

    div.innerHTML = 'some <span>text</span>';
    expect(stringify(div)).toBe('<div>some <span>text</span></div>');
  });


  it('should serialize across iframes', function() {
    var div = document.createElement('div');
    expect(__karma__.stringify(div)).toBe('<div></div>');

    expect(__karma__.stringify([1, 2])).toBe('[1, 2]');
  });
});
