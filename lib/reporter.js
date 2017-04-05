var util = require('util')
var resolve = require('url').resolve
var SourceMapConsumer = require('source-map').SourceMapConsumer
var WeakMap = require('core-js/es6/weak-map')
var _ = require('lodash')

var log = require('./logger').create('reporter')
var MultiReporter = require('./reporters/multi')
var baseReporterDecoratorFactory = require('./reporters/base').decoratorFactory

var createErrorFormatter = function (config, emitter, SourceMapConsumer) {
  var basePath = config.basePath
  var lastServedFiles = []

  emitter.on('file_list_modified', function (files) {
    lastServedFiles = files.served
  })

  var findFile = function (path) {
    for (var i = 0; i < lastServedFiles.length; i++) {
      if (lastServedFiles[i].path === path) {
        return lastServedFiles[i]
      }
    }
    return null
  }

  var URL_REGEXP = new RegExp('(?:https?:\\/\\/' +
    config.hostname + '(?:\\:' + config.port + ')?' + ')?\\/?' +
    '(base/|absolute)' + // prefix, including slash for base/ to create relative paths.
    '((?:[A-z]\\:)?[^\\?\\s\\:]*)' + // path
    '(\\?\\w*)?' + // sha
    '(\\:(\\d+))?' + // line
    '(\\:(\\d+))?' + // column
    '', 'g')

  var getSourceMapConsumer = (function () {
    var cache = new WeakMap()
    return function (sourceMap) {
      if (!cache.has(sourceMap)) {
        cache.set(sourceMap, new SourceMapConsumer(sourceMap))
      }
      return cache.get(sourceMap)
    }
  }())

  return function (input, indentation) {
    indentation = _.isString(indentation) ? indentation : ''
    if (_.isError(input)) {
      input = input.message
    } else if (_.isEmpty(input)) {
      input = ''
    } else if (!_.isString(input)) {
      input = JSON.stringify(input, null, indentation)
    }

    // remove domain and timestamp from source files
    // and resolve base path / absolute path urls into absolute path
    var msg = input.replace(URL_REGEXP, function (_, prefix, path, __, ___, line, ____, column) {
      // Find the file using basePath + path, but use the more readable path down below.
      var file = findFile(prefix === 'base/' ? basePath + '/' + path : path)

      if (file && file.sourceMap && line) {
        line = parseInt(line || '0', 10)

        column = parseInt(column, 10)

        // When no column is given and we default to 0, it doesn't make sense to only search for smaller
        // or equal columns in the sourcemap, let's search for equal or greater columns.
        var bias = column ? SourceMapConsumer.GREATEST_LOWER_BOUND : SourceMapConsumer.LEAST_UPPER_BOUND

        try {
          var original = getSourceMapConsumer(file.sourceMap)
            .originalPositionFor({line: line, column: (column || 0), bias: bias})

          // Source maps often only have a local file name, resolve to turn into a full path if
          // the path is not absolute yet.
          var sourcePath = resolve(path, original.source)
          var formattedColumn = column ? util.format(':%s', column) : ''
          return util.format('%s:%d:%d <- %s:%d%s', sourcePath, original.line, original.column,
              path, line, formattedColumn)
        } catch (e) {
          log.warn('SourceMap position not found for trace: %s', msg)
          // Fall back to non-source-mapped formatting.
        }
      }

      var result = path + (line ? ':' + line : '') + (column ? ':' + column : '')
      return result || prefix
    })

    // indent every line
    if (indentation) {
      msg = indentation + msg.replace(/\n/g, '\n' + indentation)
    }

    // allow the user to format the error
    if (config.formatError) {
      return config.formatError(msg)
    }

    return msg + '\n'
  }
}

var createReporters = function (names, config, emitter, injector) {
  var errorFormatter = createErrorFormatter(config, emitter, SourceMapConsumer)
  var reporters = []

  // TODO(vojta): instantiate all reporters through DI
  names.forEach(function (name) {
    if (['dots', 'progress'].indexOf(name) !== -1) {
      var Cls = require('./reporters/' + name)
      var ClsColor = require('./reporters/' + name + '_color')
      reporters.push(new Cls(errorFormatter, config.reportSlowerThan, config.colors, config.browserConsoleLogOptions))
      return reporters.push(new ClsColor(errorFormatter, config.reportSlowerThan, config.colors, config.browserConsoleLogOptions))
    }

    var locals = {
      baseReporterDecorator: ['factory', baseReporterDecoratorFactory],
      formatError: ['value', errorFormatter]
    }

    try {
      log.debug('Trying to load reporter: %s', name)
      reporters.push(injector.createChild([locals], ['reporter:' + name]).get('reporter:' + name))
    } catch (e) {
      if (e.message.indexOf('No provider for "reporter:' + name + '"') !== -1) {
        log.error('Can not load reporter "%s", it is not registered!\n  ' +
          'Perhaps you are missing some plugin?', name)
      } else {
        log.error('Can not load "%s"!\n  ' + e.stack, name)
      }
      emitter.emit('load_error', 'reporter', name)
      return
    }
    var colorName = name + '_color'
    if (names.indexOf(colorName) !== -1) {
      return
    }
    try {
      log.debug('Trying to load color-version of reporter: %s (%s)', name, colorName)
      reporters.push(injector.createChild([locals], ['reporter:' + name + '_color']).get('reporter:' + name))
    } catch (e) {
      log.debug('Couldn\'t load color-version.')
    }
  })

  // bind all reporters
  reporters.forEach(function (reporter) {
    emitter.bind(reporter)
  })

  return new MultiReporter(reporters)
}

createReporters.$inject = [
  'config.reporters',
  'config',
  'emitter',
  'injector'
]

// PUBLISH
exports.createReporters = createReporters
