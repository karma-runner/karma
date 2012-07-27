// monkey patch requirejs, to use append timestamps to sources
// to take advantage of testacular's heavy caching
// it would work even without this hack, but with reloading all the files all the time

var load_original = window.requirejs.load;
window.requirejs.load = function (context, moduleName, url) {
  return load_original.call(this, context, moduleName, url + '?' + window.__testacular__.files[url]);
};

window.require.config({
  baseUrl: '/base'
});

// make it async
window.__testacular__.loaded = function() {};
