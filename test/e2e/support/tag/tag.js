/* eslint-disable no-unused-vars */
var isFirefoxBefore59 = function () {
  return typeof InstallTrigger !== 'undefined' && parseFloat(navigator.userAgent.match(/\d+\.\d+$/)) < 59
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
