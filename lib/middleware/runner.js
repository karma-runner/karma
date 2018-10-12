/**
 * Runner middleware is responsible for communication with `karma run`.
 *
 * It basically triggers a test run and streams stdout back.
 */

const _ = require('lodash')
const path = require('path')
const helper = require('../helper')
const log = require('../logger').create()
const constant = require('../constants')
const json = require('body-parser').json()

// TODO(vojta): disable when single-run mode
function createRunnerMiddleware (emitter, fileList, capturedBrowsers, reporter, executor,
  /* config.protocol */ protocol, /* config.hostname */ hostname, /* config.port */
  port, /* config.urlRoot */ urlRoot, config) {
  helper.saveOriginalArgs(config)
  return function (request, response, next) {
    if (request.url !== '/__run__' && request.url !== urlRoot + 'run') {
      return next()
    }

    log.debug('Execution (fired by runner)')
    response.writeHead(200)

    if (!capturedBrowsers.length) {
      const url = `${protocol}//${hostname}:${port}${urlRoot}`
      return response.end(`No captured browser, open ${url}\n`)
    }

    json(request, response, function () {
      if (!capturedBrowsers.areAllReady([])) {
        response.write('Waiting for previous execution...\n')
      }

      const data = request.body
      emitter.once('run_start', function () {
        const responseWrite = response.write.bind(response)
        responseWrite.colors = data.colors
        reporter.addAdapter(responseWrite)

        // clean up, close runner response
        emitter.once('run_complete', function (browsers, results) {
          reporter.removeAdapter(responseWrite)
          const emptyTestSuite = (results.failed + results.success) === 0 ? 0 : 1
          response.end(constant.EXIT_CODE + emptyTestSuite + results.exitCode)
        })
      })

      helper.restoreOriginalArgs(config)
      if (_.isEmpty(data.args)) {
        log.debug('Ignoring empty client.args from run command')
      } else if ((_.isArray(data.args) && _.isArray(config.client.args)) ||
        (_.isPlainObject(data.args) && _.isPlainObject(config.client.args))) {
        log.debug('Merging client.args with ', data.args)
        config.client.args = _.merge(config.client.args, data.args)
      } else {
        log.warn('Replacing client.args with ', data.args, ' as their types do not match.')
        config.client.args = data.args
      }

      let fullRefresh = true

      if (helper.isArray(data.changedFiles)) {
        data.changedFiles.forEach(function (filepath) {
          fileList.changeFile(path.resolve(config.basePath, filepath))
          fullRefresh = false
        })
      }

      if (helper.isArray(data.addedFiles)) {
        data.addedFiles.forEach(function (filepath) {
          fileList.addFile(path.resolve(config.basePath, filepath))
          fullRefresh = false
        })
      }

      if (helper.isArray(data.removedFiles)) {
        data.removedFiles.forEach(function (filepath) {
          fileList.removeFile(path.resolve(config.basePath, filepath))
          fullRefresh = false
        })
      }

      if (fullRefresh && data.refresh !== false) {
        log.debug('Refreshing all the files / patterns')
        fileList.refresh().then(function () {
          // Wait for the file list refresh to complete before starting test run,
          // otherwise the context.html generation might not see new/updated files.
          if (!config.autoWatch) {
            executor.schedule()
          }
        })
      } else {
        executor.schedule()
      }
    })
  }
}

createRunnerMiddleware.$inject = ['emitter', 'fileList', 'capturedBrowsers', 'reporter', 'executor',
  'config.protocol', 'config.hostname', 'config.port', 'config.urlRoot', 'config']

// PUBLIC API
exports.create = createRunnerMiddleware
