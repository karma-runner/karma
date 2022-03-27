exports.instanceOf = function (value, constructorName) {
  return Object.prototype.toString.apply(value) === '[object ' + constructorName + ']'
}

exports.elm = function (id) {
  return document.getElementById(id)
}

exports.generateId = function (prefix) {
  return prefix + Math.floor(Math.random() * 10000)
}

exports.isUndefined = function (value) {
  return typeof value === 'undefined'
}

exports.isDefined = function (value) {
  return !exports.isUndefined(value)
}

exports.parseQueryParams = function (locationSearch) {
  var params = {}
  var pairs = locationSearch.slice(1).split('&')
  var keyValue

  for (var i = 0; i < pairs.length; i++) {
    keyValue = pairs[i].split('=')
    params[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1])
  }

  return params
}
