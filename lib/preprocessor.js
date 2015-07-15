var path = require('path')
var fs = require('graceful-fs')
var crypto = require('crypto')
var mm = require('minimatch')
var extensions = require('./binary-extensions.json').extensions

var log = require('./logger').create('preprocess')

var sha1 = function (data) {
  var hash = crypto.createHash('sha1')
  hash.update(data)
  return hash.digest('hex')
}

var isBinary = Object.create(null)
extensions.forEach(function (extension) {
  isBinary['.' + extension] = true
})

// TODO(vojta): instantiate preprocessors at the start to show warnings immediately
function createPreprocessor (config, basePath, injector) {
  var alreadyDisplayedWarnings = Object.create(null)

  return function (file, done) {
    var patterns = Object.keys(config)
    var thisFileIsBinary = isBinary[path.extname(file.originalPath)]
    var preprocessors = []

    function nextPreprocessor (error, content) {
      // normalize B-C
      if (arguments.length === 1 && typeof error === 'string') {
        content = error
        error = null
      }

      if (error) {
        file.content = null
        file.contentPath = null
        return done(error)
      }

      if (!preprocessors.length) {
        file.contentPath = null
        file.content = content
        file.sha = sha1(content)
        return done()
      }

      preprocessors.shift()(content, file, nextPreprocessor)
    }

    function instantiatePreprocessor (name) {
      if (alreadyDisplayedWarnings[name]) {
        return
      }

      try {
        preprocessors.push(injector.get('preprocessor:' + name))
      } catch (e) {
        if (e.message.indexOf('No provider for "preprocessor:' + name + '"') !== -1) {
          log.warn('Can not load "%s", it is not registered!\n  ' +
            'Perhaps you are missing some plugin?', name)
        } else {
          log.warn('Can not load "%s"!\n  ' + e.stack, name)
        }

        alreadyDisplayedWarnings[name] = true
      }
    }

    // collects matching preprocessors
    // TODO(vojta): should we cache this ?
    for (var i = 0; i < patterns.length; i++) {
      if (mm(file.originalPath, patterns[i])) {
        if (thisFileIsBinary) {
          log.warn('Ignoring preprocessing (%s) %s because it is a binary file.',
            config[patterns[i]].join(', '), file.originalPath)
        } else {
          config[patterns[i]].forEach(instantiatePreprocessor)
        }
      }
    }

    return fs.readFile(file.originalPath, function (err, buffer) {
      if (err) {
        throw err
      }
      nextPreprocessor(null, thisFileIsBinary ? buffer : buffer.toString())
    })
  }
}
createPreprocessor.$inject = ['config.preprocessors', 'config.basePath', 'injector']

exports.createPreprocessor = createPreprocessor
