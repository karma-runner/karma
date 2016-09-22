var fs = require('graceful-fs')
var path = require('path')

var helper = require('./helper')
var log = require('./logger').create('plugin')

var IGNORED_PACKAGES = ['karma-cli', 'karma-runner.github.com']

exports.resolve = function (plugins, emitter) {
  var modules = []

  var requirePlugin = function (name) {
    log.debug('Loading plugin %s.', name)
    try {
      modules.push(require(name))
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(name) !== -1) {
        log.error('Cannot find plugin "%s".\n  Did you forget to install it?\n' +
          '  npm install %s --save-dev', name, name)
      } else {
        log.error('Error during loading "%s" plugin:\n  %s', name, e.message)
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
      var pluginDirectory = path.normalize(path.join(__dirname, '/../..'))
      var regexp = new RegExp('^' + plugin.replace('*', '.*'))

      log.debug('Loading %s from %s', plugin, pluginDirectory)
      fs.readdirSync(pluginDirectory).filter(function (pluginName) {
        return IGNORED_PACKAGES.indexOf(pluginName) === -1 && regexp.test(pluginName)
      }).forEach(function (pluginName) {
        requirePlugin(pluginDirectory + '/' + pluginName)
      })
      return
    }
    if (helper.isObject(plugin)) {
      log.debug('Loading inlined plugin (defining %s).', Object.keys(plugin).join(', '))
      modules.push(plugin)
      return
    }
    log.error('Invalid plugin %s', plugin)
    emitter.emit('load_error', 'plug_in', plugin)
  })

  return modules
}
