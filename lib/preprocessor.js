'use strict'

const util = require('util')
const fs = require('graceful-fs')
// bind need only for mock unit tests
const readFile = util.promisify(fs.readFile.bind(fs))
const tryToRead = function (path, log) {
  const maxRetries = 3
  let promise = readFile(path)
  for (let retryCount = 1; retryCount <= maxRetries; retryCount++) {
    promise = promise.catch((err) => {
      log.warn(err)
      log.warn('retrying ' + retryCount)
      return readFile(path)
    })
  }
  return promise.catch((err) => {
    log.warn(err)
    return Promise.reject(err)
  })
}

const mm = require('minimatch')
const { isBinaryFile } = require('isbinaryfile')
const _ = require('lodash')
const CryptoUtils = require('./utils/crypto-utils')

const log = require('./logger').create('preprocess')

function executeProcessor (process, file, content) {
  let done = null
  const donePromise = new Promise((resolve, reject) => {
    done = function (error, content) {
      // normalize B-C
      if (arguments.length === 1 && typeof error === 'string') {
        content = error
        error = null
      }
      if (error) {
        reject(error)
      } else {
        resolve(content)
      }
    }
  })

  return (process(content, file, done) || Promise.resolve()).then((content) => {
    if (content) {
      // async process correctly returned content
      return content
    }
    // process called done() (Either old sync api or an async function that did not return content)
    return donePromise
  })
}

async function runProcessors (preprocessors, file, content) {
  try {
    for (let process of preprocessors) {
      content = await executeProcessor(process, file, content)
    }
  } catch (error) {
    file.contentPath = null
    file.content = null
    throw error
  }

  file.contentPath = null
  file.content = content
  file.sha = CryptoUtils.sha1(content)
}

function createPriorityPreprocessor (config = {}, preprocessorPriority, basePath, injector) {
  const emitter = injector.get('emitter')
  const alreadyDisplayedErrors = {}
  const instances = {}

  function instantiatePreprocessor (name) {
    if (alreadyDisplayedErrors[name]) {
      return
    }

    let p = instances[name]
    if (p) {
      return p
    }

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

    if (!p && !alreadyDisplayedErrors[name]) {
      alreadyDisplayedErrors[name] = true
      log.error(`Failed to instantiate preprocessor ${name}`)
      emitter.emit('load_error', 'preprocessor', name)
    } else {
      instances[name] = p
    }

    return p
  }
  _.union.apply(_, Object.values(config)).forEach(instantiatePreprocessor)

  return async function preprocess (file) {
    const buffer = await tryToRead(file.originalPath, log)
    const isBinary = await isBinaryFile(buffer, buffer.length)

    const preprocessorNames = Object.keys(config).reduce((res, pattern) => {
      if (mm(file.originalPath, pattern, { dot: true })) {
        res = _.union(res, config[pattern])
      }
      return res
    }, [])

    // Apply preprocessor priority.
    const preprocessors = preprocessorNames
      .map((name) => [name, preprocessorPriority[name] || 0])
      .sort((a, b) => b[1] - a[1])
      .map((duo) => duo[0])
      .reduce((res, name) => {
        const p = instantiatePreprocessor(name)

        if (!isBinary || (p && p.handleBinaryFiles)) {
          res.push(p)
        } else {
          log.warn(`Ignored preprocessing ${file.originalPath} because ${name} has handleBinaryFiles=false.`)
        }
        return res
      }, [])

    await runProcessors(preprocessors, file, isBinary ? buffer : buffer.toString())
  }
}

// Deprecated API
function createPreprocessor (preprocessors, basePath, injector) {
  console.log('Deprecated private createPreprocessor() API')
  const preprocessorPriority = injector.get('config.preprocessor_priority')
  return createPriorityPreprocessor(preprocessors, preprocessorPriority, basePath, injector)
}
createPreprocessor.$inject = ['config.preprocessors', 'config.basePath', 'injector']
exports.createPreprocessor = createPreprocessor

createPriorityPreprocessor.$inject = ['config.preprocessors', 'config.preprocessor_priority', 'config.basePath', 'injector']
exports.createPriorityPreprocessor = createPriorityPreprocessor
