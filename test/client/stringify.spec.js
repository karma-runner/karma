/* global __karma__ */
var assert = require('assert')

var stringify = require('../../common/stringify')

describe('stringify', function () {
  it('should serialize string', function () {
    assert.deepEqual(stringify('aaa'), "'aaa'")
  })

  it('should serialize booleans', function () {
    assert.deepEqual(stringify(true), 'true')
    assert.deepEqual(stringify(false), 'false')
  })

  it('should serialize null and undefined', function () {
    assert.deepEqual(stringify(null), 'null')
    assert.deepEqual(stringify(), 'undefined')
  })

  it('should serialize functions', function () {
    function abc (a, b, c) { return 'whatever' }
    var def = function (d, e, f) { return 'whatever' }

    var abcString = stringify(abc)
    var partsAbc = ['function', 'abc', '(a, b, c)', '{ ... }']
    var partsDef = ['function', '(d, e, f)', '{ ... }']

    partsAbc.forEach(function (part) {
      assert(abcString.indexOf(part) > -1)
    })

    var defString = stringify(def)
    partsDef.forEach(function (part) {
      assert(defString.indexOf(part) > -1)
    })
  })

  // Conditionally run Proxy tests as it's not supported by all browsers yet
  //   http://caniuse.com/#feat=proxy
  if (window.Proxy) {
    it('should serialize proxied functions', function () {
      var abcProxy = new Proxy(function abc (a, b, c) { return 'whatever' }, {})
      var defProxy = new Proxy(function (d, e, f) { return 'whatever' }, {})

      assert.deepEqual(stringify(abcProxy), 'Proxy(function abc(...) { ... })')
      assert.deepEqual(stringify(defProxy), 'Proxy(function (...) { ... })')
    })
  }

  it('should serialize arrays', function () {
    assert.deepEqual(stringify(['a', 'b', null, true, false]), "['a', 'b', null, true, false]")
  })

  it('should serialize objects', function () {
    var obj

    obj = {a: 'a', b: 'b', c: null, d: true, e: false}
    assert(stringify(obj).indexOf("{a: 'a', b: 'b', c: null, d: true, e: false}") > -1)

    function MyObj () {
      this.a = 'a'
    }

    obj = new MyObj()
    assert(stringify(obj).indexOf("{a: 'a'}") > -1)

    obj = {constructor: null}

    // IE 7 serializes this to Object{}
    var s = stringify(obj)
    assert(s.indexOf('{constructor: null}') > -1 || s.indexOf('Object{}') > -1)

    obj = Object.create(null)
    obj.a = 'a'

    assert(stringify(obj).indexOf("{a: 'a'}") > -1)
  })

  it('should serialize html', function () {
    var div = document.createElement('div')

    assert.deepEqual(stringify(div).trim().toLowerCase(), '<div></div>')

    div.innerHTML = 'some <span>text</span>'
    assert.deepEqual(stringify(div).trim().toLowerCase(), '<div>some <span>text</span></div>')
  })

  it('should serialize DOMParser objects', function () {
    if (typeof DOMParser !== 'undefined') {
      // Test only works in IE 9 and above
      var parser = new DOMParser()
      var doc = parser.parseFromString('<test></test>', 'application/xml')
      assert.deepEqual(stringify(doc), '<test></test>')
    }
  })

  it('should serialize across iframes', function () {
    var div = document.createElement('div')
    assert.deepEqual(__karma__.stringify(div).trim().toLowerCase(), '<div></div>')

    assert.deepEqual(__karma__.stringify([1, 2]), '[1, 2]')
  })

  it('should stringify object with property tagName as Object', function () {
    assert(stringify({tagName: 'a'}).indexOf("{tagName: 'a'}") > -1)
  })
})
