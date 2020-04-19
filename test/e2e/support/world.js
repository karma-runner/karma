const fs = require('fs')
const vm = require('vm')
const path = require('path')
const hasher = require('crypto').createHash
const mkdirp = require('mkdirp')
const _ = require('lodash')
const { setWorldConstructor } = require('cucumber')
const Proxy = require('./proxy')

class World {
  constructor () {
    this.proxy = new Proxy()
    this.template = _.template(`process.env.CHROME_BIN = require('puppeteer').executablePath(); module.exports = function (config) {\n  config.set(\n    <%= content %>\n  );\n};`)

    this.configFile = {
      singleRun: true,
      reporters: ['dots'],
      frameworks: ['jasmine'],
      basePath: __dirname,
      colors: false,
      __dirname: __dirname,
      _resolve: (name) => path.resolve(__dirname, '..', 'support', name)
    }

    this.lastRun = {
      error: null,
      stdout: '',
      stderr: ''
    }
  }

  addConfigContent (content) {
    if (content == null) {
      content = ''
    }
    return vm.runInNewContext(content, this.configFile)
  }

  writeConfigFile (dir, file, done) {
    return mkdirp(dir, 0x1ed, (err) => {
      let content, hash
      if (err) {
        return done(err)
      }

      delete this.configFile.__dirname
      content = this.generateJS(this.configFile)
      hash = hasher('md5').update(content + Math.random()).digest('hex')
      fs.writeFile(path.join(dir, hash + '.' + file), content, (err) => {
        done(err, hash)
      })
    })
  }

  generateJS (config) {
    return this.template({
      content: JSON.stringify(Object.assign({}, config, {
        customLaunchers: Object.assign({
          ChromeHeadlessNoSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox'] }
        }, config.customLaunchers)
      }))
    })
  }
}

setWorldConstructor(World)
