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
      if (e.code === 'MODULE_NOT_FOUND' && e.message.includes(name)) {
        log.error(`Cannot find plugin "${name}".\n  Did you forget to install it?\n  npm install ${name} --save-dev`)
      } else {
        log.error(`Error during loading "${name}" plugin:\n  ${e.message}`)
      }
      emitter.emit('load_error', 'plug_in', name)
    }
  }

  plugins.forEach(function (plugin) {
    if (helper.isString(plugin)) {
      if (!plugin.includes('*')) {
        requirePlugin(plugin)
        return
      }
      const pluginDirectory = path.normalize(path.join(__dirname, '/../..'))
      const regexp = new RegExp(`^${plugin.replace('*', '.*')}`)

      log.debug(`Loading ${plugin} from ${pluginDirectory}`)
      fs.readdirSync(pluginDirectory)
        .filter((pluginName) => !IGNORED_PACKAGES.includes(pluginName) && regexp.test(pluginName))
        .forEach((pluginName) => requirePlugin(`${pluginDirectory}/${pluginName}`))
    } else if (helper.isObject(plugin)) {
      log.debug(`Loading inline plugin defining ${Object.keys(plugin).join(', ')}.`)
      modules.push(plugin)
    } else {
      log.error(`Invalid plugin ${plugin}`)
      emitter.emit('load_error', 'plug_in', plugin)
    }
  })

  return modules
}

/**
  Create a function to handle errors in plugin loading.
  @param {Object} injector, the dict of dependency injection objects.
  @return function closed over injector, which reports errors.
*/
function createInstantiatePlugin (injector) {
  const emitter = injector.get('emitter')
  // Cache to avoid report errors multiple times per plugin.
  const pluginInstances = new Map()
  return function instantiatePlugin (kind, name) {
    if (pluginInstances.has(name)) {
      return pluginInstances.get(name)
    }

    let p
    try {
      p = injector.get(`${kind}:${name}`)
      if (!p) {
        log.error(`Failed to instantiate ${kind} ${name}`)
        emitter.emit('load_error', kind, name)
      }
    } catch (e) {
      if (e.message.includes(`No provider for "${kind}:${name}"`)) {
        log.error(`Cannot load "${name}", it is not registered!\n  Perhaps you are missing some plugin?`)
      } else {
        log.error(`Cannot load "${name}"!\n  ` + e.stack)
      }
      emitter.emit('load_error', kind, name)
    }
    pluginInstances.set(name, p, `${kind}:${name}`)
    return p
  }
}

createInstantiatePlugin.$inject = ['injector']

module.exports = { resolve, createInstantiatePlugin }
