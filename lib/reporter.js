'use strict'

const resolve = require('url').resolve
const SourceMapConsumer = require('source-map').SourceMapConsumer
const _ = require('lodash')

const PathUtils = require('./utils/path-utils')
const log = require('./logger').create('reporter')
const MultiReporter = require('./reporters/multi')
const baseReporterDecoratorFactory = require('./reporters/base').decoratorFactory

function createErrorFormatter (config, emitter, SourceMapConsumer) {
  const basePath = config.basePath
  const urlRoot = config.urlRoot === '/' ? '' : (config.urlRoot || '')
  let lastServedFiles = []

  emitter.on('file_list_modified', (files) => {
    lastServedFiles = files.served
  })

  const URL_REGEXP = new RegExp('(?:https?:\\/\\/' +
    config.hostname + '(?:\\:' + config.port + ')?' + ')?\\/?' +
    urlRoot + '\\/?' +
    '(base/|absolute)' + // prefix, including slash for base/ to create relative paths.
    '((?:[A-z]\\:)?[^\\?\\s\\:]*)' + // path
    '(\\?\\w*)?' + // sha
    '(\\:(\\d+))?' + // line
    '(\\:(\\d+))?' + // column
    '', 'g')

  const cache = new WeakMap()

  function getSourceMapConsumer (sourceMap) {
    if (!cache.has(sourceMap)) {
      cache.set(sourceMap, new SourceMapConsumer(sourceMap))
    }
    return cache.get(sourceMap)
  }

  return function (input, indentation) {
    indentation = _.isString(indentation) ? indentation : ''
    if (_.isError(input)) {
      input = input.message
    } else if (_.isEmpty(input)) {
      input = ''
    } else if (!_.isString(input)) {
      input = JSON.stringify(input, null, indentation)
    }

    let msg = input.replace(URL_REGEXP, function (_, prefix, path, __, ___, line, ____, column) {
      const normalizedPath = prefix === 'base/' ? `${basePath}/${path}` : path
      const file = lastServedFiles.find((file) => file.path === normalizedPath)

      if (file && file.sourceMap && line) {
        line = +line
        column = +column

        // When no column is given and we default to 0, it doesn't make sense to only search for smaller
        // or equal columns in the sourcemap, let's search for equal or greater columns.
        const bias = column ? SourceMapConsumer.GREATEST_LOWER_BOUND : SourceMapConsumer.LEAST_UPPER_BOUND

        try {
          const original = getSourceMapConsumer(file.sourceMap).originalPositionFor({ line, column: (column || 0), bias })

          // Source maps often only have a local file name, resolve to turn into a full path if
          // the path is not absolute yet.
          return `${PathUtils.formatPathMapping(resolve(path, original.source), original.line, original.column)} <- ${PathUtils.formatPathMapping(path, line, column)}`
        } catch (e) {
          log.warn(`SourceMap position not found for trace: ${input}`)
        }
      }

      return PathUtils.formatPathMapping(path, line, column) || prefix
    })

    if (indentation) {
      msg = indentation + msg.replace(/\n/g, '\n' + indentation)
    }

    return config.formatError ? config.formatError(msg) : msg + '\n'
  }
}

function createReporters (names, config, emitter, injector) {
  const errorFormatter = createErrorFormatter(config, emitter, SourceMapConsumer)
  const reporters = []

  names.forEach((name) => {
    if (['dots', 'progress'].includes(name)) {
      [
        require(`./reporters/${name}`),
        require(`./reporters/${name}_color`)
      ].forEach((Reporter) => {
        reporters.push(new Reporter(errorFormatter, config.reportSlowerThan, config.colors, config.browserConsoleLogOptions))
      })
      return
    }

    const locals = {
      baseReporterDecorator: ['factory', baseReporterDecoratorFactory],
      formatError: ['value', errorFormatter]
    }

    try {
      log.debug(`Trying to load reporter: ${name}`)
      reporters.push(injector.createChild([locals], ['reporter:' + name]).get('reporter:' + name))
    } catch (e) {
      if (e.message.includes(`No provider for "reporter:${name}"`)) {
        log.error(`Can not load reporter "${name}", it is not registered!\n  Perhaps you are missing some plugin?`)
      } else {
        log.error(`Can not load "${name}"!\n ${e.stack}`)
      }
      emitter.emit('load_error', 'reporter', name)
      return
    }

    const colorName = name + '_color'
    if (!names.includes(colorName)) {
      try {
        log.debug(`Trying to load color-version of reporter: ${name} (${colorName})`)
        reporters.push(injector.createChild([locals], ['reporter:' + colorName]).get('reporter:' + name))
      } catch (e) {
        log.debug('Couldn\'t load color-version.')
      }
    }
  })

  reporters.forEach((reporter) => emitter.bind(reporter))

  return new MultiReporter(reporters)
}

createReporters.$inject = [
  'config.reporters',
  'config',
  'emitter',
  'injector'
]

exports.createReporters = createReporters
