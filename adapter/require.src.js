// monkey patch requirejs, to use append timestamps to sources
// to take advantage of testacular's heavy caching
// it would work even without this hack, but with reloading all the files all the time

var load_original = window.requirejs.load;
requirejs.load = function (context, moduleName, url) {
  return load_original.call(this, context, moduleName, url + '?' + __testacular__.files[url]);
};

var contexts = requirejs.s.contexts;

for (var context in contexts) {
  if (contexts.hasOwnProperty(context)) {
    contexts[context].config.baseUrl = '/base/' + contexts[context].config.baseUrl;
  }
}

// make it async
__testacular__.loaded = function() {};
