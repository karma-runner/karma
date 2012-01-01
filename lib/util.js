var BROWSER = /(Chrome|Firefox|Opera|Safari)\/([0-9]*\.[0-9]*)/;
var VERSION = /Version\/([0-9]*\.[0-9]*)/;
var MSIE = /MSIE ([0-9]*\.[0-9]*)/;

// TODO(vojta): parse IE, Android, iPhone, etc...
exports.browserFullNameToShort = function(fullName) {
  var browserMatch = fullName.match(BROWSER);
  if (browserMatch) {
    var versionMatch = fullName.match(VERSION);
    return browserMatch[1] + ' ' + (versionMatch && versionMatch[1] || browserMatch[2]);
  }

  var ieMatch = fullName.match(MSIE);
  if (ieMatch) {
    return 'IE ' + ieMatch[1];
  }

  return fullName;
};


exports.formatError = function(msg, indentation) {
  // remove domain and timestamp from source files
  msg = msg.replace(/https?:\/\/[^\/]*([^\?\s]*)(\?[0-9]*)?/g, '$1');

  // indent every line
  if (indentation) {
    msg = indentation + msg.replace(/\n/g, '\n' + indentation);
  }

  return msg;
};
