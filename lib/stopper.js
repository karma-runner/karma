const http = require('http')
const cfg = require('./config')
const logger = require('./logger')
const helper = require('./helper')

exports.stop = function (cliOptionsOrConfig, done) {
  cliOptionsOrConfig = cliOptionsOrConfig || {}
  logger.setupFromConfig({
    colors: cliOptionsOrConfig.colors,
    logLevel: cliOptionsOrConfig.logLevel
  })
  const log = logger.create('stopper')
  done = helper.isFunction(done) ? done : process.exit

  let config
  if (cliOptionsOrConfig instanceof cfg.Config) {
    config = cliOptionsOrConfig
  } else {
    try {
      config = cfg.parseConfig(
        cliOptionsOrConfig.configFile,
        cliOptionsOrConfig,
        {
          promiseConfig: false,
          throwErrors: true
        }
      )
    } catch (parseConfigError) {
      // TODO: change how `done` falls back to exit in next major version
      //  SEE: https://github.com/karma-runner/karma/pull/3635#discussion_r565399378
      done(1)
    }
  }
  config = cfg.parseConfig(config.configFile, config)

  const request = http.request({
    hostname: config.hostname,
    path: config.urlRoot + 'stop',
    port: config.port,
    method: 'GET'
  })

  request.on('response', function (response) {
    if (response.statusCode === 200) {
      log.info('Server stopped.')
      done(0)
    } else {
      log.error(`Server returned status code: ${response.statusCode}`)
      done(1)
    }
  })

  request.on('error', function (e) {
    if (e.code === 'ECONNREFUSED') {
      log.error(`There is no server listening on port ${config.port}`)
      done(1, e.code)
    } else {
      throw e
    }
  })
  request.end()
}
