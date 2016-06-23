var fs = require('fs')
var vm = require('vm')
var path = require('path')
var hasher = require('crypto').createHash
var mkdirp = require('mkdirp')
var _ = require('lodash')

exports.World = function World () {
  this.template = _.template('module.exports = function (config) {\n  config.set(\n    <%= content %>\n  );\n};')

  this.configExt = 'js'
  this.raw = false
  this.configFile = {
    singleRun: true,
    reporters: ['dots'],
    frameworks: ['jasmine'],
    basePath: __dirname,
    colors: false,
    __dirname: __dirname
  }

  this.addConfigContent = (function (_this) {
    return function (content) {
      if (content == null) {
        content = ''
      }
      _this.raw = false
      vm.runInNewContext(content, _this.configFile)
    }
  })(this)

  this.addRawConfigContent = (function (_this) {
    return function (content, ext) {
      if (content == null) {
        content = ''
      }
      _this.raw = true
      _this.configExt = ext
      _this.configFile = content
    }
  })(this)

  this.writeConfigFile = (function (_this) {
    return function (dir, file, done) {
      return mkdirp(dir, 0x1ed, function (err) {
        var content, hash
        if (err) {
          return done(err)
        }

        delete _this.configFile.__dirname
        content = _this.raw ? _this.configFile : _this.generateJS(_this.configFile)
        hash = hasher('md5').update(content + Math.random()).digest('hex')
        var name = [hash, file, _this.configExt].join('.')
        fs.writeFile(path.join(dir, name), content, function (err) {
          done(err, hash)
        })
      })
    }
  })(this)

  this.generateJS = function (config) {
    return this.template({
      content: JSON.stringify(config)
    })
  }

  this.lastRun = {
    error: null,
    stdout: '',
    stderr: ''
  }
}
