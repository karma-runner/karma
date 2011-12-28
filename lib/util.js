var BROWSER = /(Chrome|Firefox|Opera|Safari)\/([0-9]*\.[0-9]*)/;
var VERSION = /Version\/([0-9]*\.[0-9]*)/;

// TODO(vojta): parse IE, Android, iPhone, etc...
exports.browserFullNameToShort = function(fullName) {
  var browserMatch = fullName.match(BROWSER);

  if (browserMatch) {
    var versionMatch = fullName.match(VERSION);
    return browserMatch[1] + ' ' + (versionMatch && versionMatch[1] || browserMatch[2]);
  }

  return fullName;
};
