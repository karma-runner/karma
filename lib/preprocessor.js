var fs = require('graceful-fs')
var crypto = require('crypto')
var mm = require('minimatch')
var isBinaryFile = require('isbinaryfile')
var combineLists = require('combine-lists')

var log = require('./logger').create('preprocess')

var sha1 = function (data) {
  var hash = crypto.createHash('sha1')
  hash.update(data)
  return hash.digest('hex')
}

var createNextProcessor = function (preprocessors, file, done) {
  return function nextPreprocessor (error, content) {
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
}

var createPreprocessor = function (config, basePath, injector) {
  var alreadyDisplayedErrors = {}
  var instances = {}
  var patterns = Object.keys(config)

  var emitter = injector.get('emitter')

  var instantiatePreprocessor = function (name) {
    if (alreadyDisplayedErrors[name]) {
      return
    }

    var p

    try {
      p = injector.get('preprocessor:' + name)
    } catch (e) {
      if (e.message.indexOf('No provider for "preprocessor:' + name + '"') !== -1) {
        log.error('Can not load "%s", it is not registered!\n  ' +
          'Perhaps you are missing some plugin?', name)
      } else {
        log.error('Can not load "%s"!\n  ' + e.stack, name)
      }
      alreadyDisplayedErrors[name] = true
      emitter.emit('load_error', 'preprocessor', name)
    }

    return p
  }

  var allPreprocessors = []
  patterns.forEach(function (pattern) {
    allPreprocessors = combineLists(allPreprocessors, config[pattern])
  })
  allPreprocessors.forEach(instantiatePreprocessor)

  return function preprocess (file, done) {
    patterns = Object.keys(config)

    return fs.readFile(file.originalPath, function (err, buffer) {
      if (err) {
        throw err
      }

      isBinaryFile(buffer, buffer.length, function (err, thisFileIsBinary) {
        if (err) {
          throw err
        }

        var preprocessorNames = []
        for (var i = 0; i < patterns.length; i++) {
          if (mm(file.originalPath, patterns[i], {dot: true})) {
            if (thisFileIsBinary) {
              log.warn('Ignoring preprocessing (%s) %s because it is a binary file.',
                config[patterns[i]].join(', '), file.originalPath)
            } else {
              preprocessorNames = combineLists(preprocessorNames, config[patterns[i]])
            }
          }
        }

        var preprocessors = []
        var nextPreprocessor = createNextProcessor(preprocessors, file, done)
        preprocessorNames.forEach(function (name) {
          var p = instances[name]
          if (p == null) {
            p = instantiatePreprocessor(name)
          }

          if (p == null) {
            if (!alreadyDisplayedErrors[name]) {
              alreadyDisplayedErrors[name] = true
              log.error('Failed to instantiate preprocessor %s', name)
              emitter.emit('load_error', 'preprocessor', name)
            }
            return
          }

          instances[name] = p
          preprocessors.push(p)
        })

        nextPreprocessor(null, thisFileIsBinary ? buffer : buffer.toString())
      })
    })
  }
}
createPreprocessor.$inject = ['config.preprocessors', 'config.basePath', 'injector']

exports.createPreprocessor = createPreprocessor
