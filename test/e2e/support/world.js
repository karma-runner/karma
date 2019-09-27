const fs = require('fs')
const vm = require('vm')
const path = require('path')
const hasher = require('crypto').createHash
const mkdirp = require('mkdirp')
const _ = require('lodash')
const cucumber = require('cucumber')

function World () {
  this.proxy = require('./proxy')
  this.template = _.template('process.env.CHROME_BIN = require(\'puppeteer\').executablePath(); module.exports = function (config) {\n  config.set(\n    <%= content %>\n  );\n};')

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
        if (err) {
          return done(err)
        }

        delete _this.configFile.__dirname
        const content = _this.generateJS(_this.configFile)
        const hash = hasher('md5').update(content + Math.random()).digest('hex')
        fs.writeFile(path.join(dir, hash + '.' + file), content, function (err) {
          done(err, hash)
        })
      })
    }
  })(this)

  this.generateJS = function (config) {
    return this.template({
      content: JSON.stringify(Object.assign({}, config, {
        customLaunchers: Object.assign({
          ChromeHeadlessNoSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox'] }
        }, config.customLaunchers)
      }))
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
