// monkey patch requirejs, to use append timestamps to sources
// to take advantage of testacular's heavy caching
// it would work even without this hack, but with reloading all the files all the time

var load_original = window.requirejs.load;
requirejs.load = function (context, moduleName, url) {
  return load_original.call(this, context, moduleName, url + '?' + __testacular__.files[url]);
};

require.config({
  baseUrl: '/base'
});

// make it async
__testacular__.loaded = function() {
  var toBeLoaded = __testacular__.jsIncludes.requirejs;
  if (toBeLoaded) {
    require(toBeLoaded, function() {
      __testacular__.start();
    });
  }
};
