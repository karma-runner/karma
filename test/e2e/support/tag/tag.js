/* eslint-disable no-unused-vars */
function isFirefoxBefore59 () {
  return typeof InstallTrigger !== 'undefined' && parseFloat(navigator.userAgent.match(/\d+\.\d+$/)) < 59
}

function containsJsTag () {
  var scripts = document.getElementsByTagName('script')
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].type.indexOf(';version=') > -1) {
      return true
    }
  }
  return false
}
