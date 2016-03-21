/* eslint-disable no-unused-vars */
var isFirefox = function () {
  return typeof InstallTrigger !== 'undefined'
}

var containsJsTag = function () {
  var scripts = document.getElementsByTagName('script')
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].type.indexOf(';version=') > -1) {
      return true
    }
  }
  return false
}
