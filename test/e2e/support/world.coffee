fs = require 'fs'
vm = require 'vm'
path = require 'path'
hasher = require('crypto').createHash

mkdirp = require 'mkdirp'
_ = require 'lodash'


World = (callback) ->

  @template = _.template """
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
      return done err if err

      # Remove dirname from config again
      delete @configFile.__dirname

      content = @generateJS @configFile
      hash = hasher('md5').update(content + Math.random()).digest 'hex';
      fs.writeFile path.join(dir, hash + '.' + file), content, (err) ->
        done err, hash

  @generateJS = (config) ->
    @template {content: JSON.stringify config}

  @lastRun =
    error: null
    stdout: ''
    stderr: ''

  callback()

exports.World = World
