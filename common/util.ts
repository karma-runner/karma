export function instanceOf(value, constructorName) {
  return Object.prototype.toString.apply(value) === '[object ' + constructorName + ']'
}

export function elm(id) {
  return document.getElementById(id)
}

export function generateId(prefix) {
  return prefix + Math.floor(Math.random() * 10000)
}

export function isUndefined(value) {
  return typeof value === 'undefined'
}

export function isDefined(value) {
  return !exports.isUndefined(value)
}

export function parseQueryParams(locationSearch): any {
  var params = {}
  var pairs = locationSearch.substr(1).split('&')
  var keyValue

  for (var i = 0; i < pairs.length; i++) {
    keyValue = pairs[i].split('=')
    params[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1])
  }

  return params
}
