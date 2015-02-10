fs = require 'fs'
vm = require 'vm'
path = require 'path'

mkdirp = require 'mkdirp'
_ = require 'lodash'


World = (callback) ->

  @template = """
    module.exports = function (config) {
      config.set(
        <%= content %>
      );
    };
  """
  @configFile =
    singleRun: true
    reporters: ['dots']
    frameworks: ['jasmine']
    basePath: __dirname
    colors: false
    __dirname: __dirname

  @addConfigContent = (content='') =>
    vm.runInNewContext(content, @configFile)

  # Generate a configuration file and save it to path.
  @writeConfigFile = (dir, file, done) =>
    mkdirp dir, 0o0755, (err) =>
      throw new Error(err) if err

      # Remove dirname from config again
      delete @configFile.__dirname

      content = @generateJS @configFile
      fs.writeFile path.join(dir, file), content, done

  @generateJS = (config) ->
    _.template @template, {content: JSON.stringify config}

  @lastRun =
    error: null
    stdout: ''
    stderr: ''

  callback()

exports.World = World
