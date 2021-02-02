/* global __karma__ */
var assert = require('assert')

var stringify = require('../../common/stringify')

describe('stringify', function () {
  if (window && window.Symbol) {
    // IE does not support Symbol
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol
    it('should serialize symbols', function () {
      assert.deepStrictEqual(stringify(Symbol.for('x')), 'Symbol(x)')
    })
  }

  it('should serialize string', function () {
    assert.deepStrictEqual(stringify('aaa'), "'aaa'")
  })

  it('should serialize booleans', function () {
    assert.deepStrictEqual(stringify(true), 'true')
    assert.deepStrictEqual(stringify(false), 'false')
  })

  it('should serialize null and undefined', function () {
    assert.deepStrictEqual(stringify(null), 'null')
    assert.deepStrictEqual(stringify(), 'undefined')
  })

  it('should serialize functions', function () {
    function abc (a, b, c) { return 'whatever' }
    function def (d, e, f) { return 'whatever' }

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
      var defProxy = new Proxy(function (d, e, f) { return 'whatever' }, {})
      // In Safari stringified Proxy object has ProxyObject as a name, but
      // in other browsers it does not.
      assert.deepStrictEqual(/^function (ProxyObject)?\(\) { ... }$/.test(stringify(defProxy)), true)
    })
  }

  it('should serialize arrays', function () {
    assert.deepStrictEqual(stringify(['a', 'b', null, true, false]), "['a', 'b', null, true, false]")
  })

  it('should serialize objects', function () {
    var obj

    obj = { a: 'a', b: 'b', c: null, d: true, e: false }
    assert(stringify(obj).indexOf("{a: 'a', b: 'b', c: null, d: true, e: false}") > -1)

    function MyObj () {
      this.a = 'a'
    }

    obj = new MyObj()
    assert(stringify(obj).indexOf("{a: 'a'}") > -1)

    obj = { constructor: null }

    // IE 7 serializes this to Object{}
    var s = stringify(obj)
    assert(s.indexOf('{constructor: null}') > -1 || s.indexOf('Object{}') > -1)

    obj = Object.create(null)
    obj.a = 'a'

    assert(stringify(obj).indexOf("{a: 'a'}") > -1)
  })

  it('should serialize html', function () {
    var div = document.createElement('div')

    assert.deepStrictEqual(stringify(div).trim().toLowerCase(), '<div></div>')

    div.innerHTML = 'some <span>text</span>'
    assert.deepStrictEqual(stringify(div).trim().toLowerCase(), '<div>some <span>text</span></div>')
  })

  it('should serialize error', function () {
    var error = new TypeError('Error description')
    assert(stringify(error).indexOf('Error description') > -1)
  })

  it('should serialize DOMParser objects', function () {
    if (typeof DOMParser !== 'undefined') {
      // Test only works in IE 9 and above
      var parser = new DOMParser()
      var doc = parser.parseFromString('<test></test>', 'application/xml')
      assert.deepStrictEqual(stringify(doc), '<test></test>')
    }
  })

  it('should serialize across iframes', function () {
    var div = document.createElement('div')
    assert.deepStrictEqual(__karma__.stringify(div).trim().toLowerCase(), '<div></div>')

    assert.deepStrictEqual(__karma__.stringify([1, 2]), '[1, 2]')
  })

  it('should stringify object with property tagName as Object', function () {
    assert(stringify({ tagName: 'a' }).indexOf("{tagName: 'a'}") > -1)
  })
})
