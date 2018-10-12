'use strict'

const fs = require('graceful-fs')
const mm = require('minimatch')
const isBinaryFile = require('isbinaryfile')
const combineLists = require('combine-lists')
const CryptoUtils = require('./utils/crypto-utils')

const log = require('./logger').create('preprocess')

function createNextProcessor (preprocessors, file, done) {
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
      file.sha = CryptoUtils.sha1(content)
      return done()
    }

    preprocessors.shift()(content, file, nextPreprocessor)
  }
}

function createPreprocessor (config, basePath, injector) {
  const emitter = injector.get('emitter')
  const alreadyDisplayedErrors = {}
  const instances = {}
  let patterns = Object.keys(config)

  function instantiatePreprocessor (name) {
    if (alreadyDisplayedErrors[name]) {
      return
    }

    let p

    try {
      p = injector.get('preprocessor:' + name)
    } catch (e) {
      if (e.message.includes(`No provider for "preprocessor:${name}"`)) {
        log.error(`Can not load "${name}", it is not registered!\n  Perhaps you are missing some plugin?`)
      } else {
        log.error(`Can not load "${name}"!\n  ` + e.stack)
      }
      alreadyDisplayedErrors[name] = true
      emitter.emit('load_error', 'preprocessor', name)
    }

    return p
  }

  let allPreprocessors = []
  patterns.forEach((pattern) => {
    allPreprocessors = combineLists(allPreprocessors, config[pattern])
  })
  allPreprocessors.forEach(instantiatePreprocessor)

  return function preprocess (file, done) {
    patterns = Object.keys(config)
    let retryCount = 0
    let maxRetries = 3
    function readFileCallback (err, buffer) {
      if (err) {
        log.warn(err)
        if (retryCount < maxRetries) {
          retryCount++
          log.warn('retrying ' + retryCount)
          fs.readFile(file.originalPath, readFileCallback)
          return
        } else {
          throw err
        }
      }

      isBinaryFile(buffer, buffer.length, function (err, isBinary) {
        if (err) {
          throw err
        }

        let preprocessorNames = []
        patterns.forEach((pattern) => {
          if (mm(file.originalPath, pattern, {dot: true})) {
            preprocessorNames = combineLists(preprocessorNames, config[pattern])
          }
        })

        let preprocessors = []
        const nextPreprocessor = createNextProcessor(preprocessors, file, done)
        preprocessorNames.forEach((name) => {
          const p = instances[name] || instantiatePreprocessor(name)

          if (p == null) {
            if (!alreadyDisplayedErrors[name]) {
              alreadyDisplayedErrors[name] = true
              log.error(`Failed to instantiate preprocessor ${name}`)
              emitter.emit('load_error', 'preprocessor', name)
            }
            return
          }

          instances[name] = p
          if (!isBinary || p.handleBinaryFiles) {
            preprocessors.push(p)
          } else {
            log.warn(`Ignored preprocessing ${file.originalPath} because ${name} has handleBinaryFiles=false.`)
          }
        })

        nextPreprocessor(null, isBinary ? buffer : buffer.toString())
      })
    }
    return fs.readFile(file.originalPath, readFileCallback)
  }
}

createPreprocessor.$inject = ['config.preprocessors', 'config.basePath', 'injector']

exports.createPreprocessor = createPreprocessor
