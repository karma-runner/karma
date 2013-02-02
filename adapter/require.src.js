// monkey patch requirejs, to use append timestamps to sources
// to take advantage of testacular's heavy caching
// it would work even without this hack, but with reloading all the files all the time

var load_original = window.requirejs.load;
requirejs.load = function (context, moduleName, url) {
  if (__testacular__.files.hasOwnProperty(url)) {
    url = url + '?' + __testacular__.files[url];
  } else {
    console.error('There is no timestamp for ' + url + '!');
  }

  return load_original.call(this, context, moduleName, url);
};

require.config({
  baseUrl: '/base'
});

// make it async
__testacular__.loaded = function() {};
