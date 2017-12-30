var serialize = require('dom-serialize')
var instanceOf = require('./util').instanceOf
var isNode = function (obj) {
  return (obj.tagName || obj.nodeName) && obj.nodeType
}

var stringify = function stringify (obj, depth) {
  if (depth === 0) {
    return '...'
  }

  if (obj === null) {
    return 'null'
  }

  switch (typeof obj) {
    case 'string':
      return "'" + obj + "'"
    case 'undefined':
      return 'undefined'
    case 'function':
      try {
        // function abc(a, b, c) { /* code goes here */ }
        //   -> function abc(a, b, c) { ... }
        return obj.toString().replace(/\{[\s\S]*\}/, '{ ... }')
      } catch (err) {
        if (err instanceof TypeError) {
          // Proxy(function abc(...) { ... })
          return 'Proxy(function ' + (obj.name || '') + '(...) { ... })'
        } else {
          throw err
        }
      }
    case 'boolean':
      return obj ? 'true' : 'false'
    case 'object':
      var strs = []
      if (instanceOf(obj, 'Array')) {
        strs.push('[')
        for (var i = 0, ii = obj.length; i < ii; i++) {
          if (i) {
            strs.push(', ')
          }
          strs.push(stringify(obj[i], depth - 1))
        }
        strs.push(']')
      } else if (instanceOf(obj, 'Date')) {
        return obj.toString()
      } else if (instanceOf(obj, 'Text')) {
        return obj.nodeValue
      } else if (instanceOf(obj, 'Comment')) {
        return '<!--' + obj.nodeValue + '-->'
      } else if (obj.outerHTML) {
        return obj.outerHTML
      } else if (isNode(obj)) {
        return serialize(obj)
      } else if (instanceOf(obj, 'Error')) {
        return obj.toString() + '\n' + obj.stack
      } else {
        var constructor = 'Object'
        if (obj.constructor && typeof obj.constructor === 'function') {
          constructor = obj.constructor.name
        }

        strs.push(constructor)
        strs.push('{')
        var first = true
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (first) {
              first = false
            } else {
              strs.push(', ')
            }

            strs.push(key + ': ' + stringify(obj[key], depth - 1))
          }
        }
        strs.push('}')
      }
      return strs.join('')
    default:
      return obj
  }
}

module.exports = stringify
