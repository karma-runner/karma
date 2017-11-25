var fs = require('fs')
var vm = require('vm')
var path = require('path')
var hasher = require('crypto').createHash
var mkdirp = require('mkdirp')
var _ = require('lodash')
var cucumber = require('cucumber')

function World () {
  this.proxy = require('./proxy')

  this.template = _.template('module.exports = function (config) {\n  config.set(\n    <%= content %>\n  );\n};')

  this.configFile = {
    singleRun: true,
    reporters: ['dots'],
    frameworks: ['jasmine'],
    basePath: __dirname,
    colors: false,
    __dirname: __dirname,
    _resolve: function (name) {
      return path.resolve(__dirname, '..', 'support', name)
    }
  }

  this.addConfigContent = (function (_this) {
    return function (content) {
      if (content == null) {
        content = ''
      }
      return vm.runInNewContext(content, _this.configFile)
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
        content = _this.generateJS(_this.configFile)
        hash = hasher('md5').update(content + Math.random()).digest('hex')
        fs.writeFile(path.join(dir, hash + '.' + file), content, function (err) {
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

cucumber.defineSupportCode((a) => {
  a.setWorldConstructor(World)
})
