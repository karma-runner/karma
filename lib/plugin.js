'use strict'

const fs = require('graceful-fs')
const path = require('path')
const helper = require('./helper')

const log = require('./logger').create('plugin')

const IGNORED_PACKAGES = ['karma-cli', 'karma-runner.github.com']

function resolve (plugins, emitter) {
  const modules = []

  function requirePlugin (name) {
    log.debug(`Loading plugin ${name}.`)
    try {
      modules.push(require(name))
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
        log.error(`Cannot find plugin "${name}".\n  Did you forget to install it?\n  npm install ${name} --save-dev`)
      } else {
        log.error(`Error during loading "${name}" plugin:\n  ${e.message}`)
      }
      emitter.emit('load_error', 'plug_in', name)
    }
  }

  plugins.forEach(function (plugin) {
    if (helper.isString(plugin)) {
      if (plugin.indexOf('*') === -1) {
        requirePlugin(plugin)
        return
      }
      const pluginDirectory = path.normalize(path.join(__dirname, '/../..'))
      const regexp = new RegExp(`^${plugin.replace('*', '.*')}`)

      log.debug(`Loading ${plugin} from ${pluginDirectory}`)
      fs.readdirSync(pluginDirectory)
        .filter((pluginName) => IGNORED_PACKAGES.indexOf(pluginName) === -1 && regexp.test(pluginName))
        .forEach((pluginName) => requirePlugin(pluginDirectory + '/' + pluginName))
    } else if (helper.isObject(plugin)) {
      log.debug(`Loading inlined plugin (defining ${Object.keys(plugin).join(', ')}).`)
      modules.push(plugin)
    } else {
      log.error(`Invalid plugin ${plugin}`)
      emitter.emit('load_error', 'plug_in', plugin)
    }
  })

  return modules
}

exports.resolve = resolve
