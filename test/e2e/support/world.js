const fs = require('fs')
const vm = require('vm')
const path = require('path')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const { setWorldConstructor } = require('cucumber')
const Proxy = require('./proxy')

class World {
  constructor () {
    this.proxy = new Proxy()

    /**
     * The current working directory path for all Karma commands.
     * @type {string}
     */
    this.workDir = fs.realpathSync(__dirname)

    /**
     * The directory where all files generated during tests are stored.
     * It is removed after each scenario.
     * @type {string}
     */
    this.sandboxDir = path.join(this.workDir, 'sandbox')

    /**
     * Path to the final Karma config file.
     * @type {string}
     */
    this.configFile = path.join(this.sandboxDir, 'karma.conf.js')

    /**
     * Absolute path to the Karma executable.
     * @type {string}
     */
    this.karmaExecutable = fs.realpathSync(path.join(__dirname, '../../../bin/karma'))

    this.config = {
      singleRun: true,
      reporters: ['dots'],
      frameworks: ['jasmine'],
      basePath: this.workDir,
      colors: false,
      // Current approach uses vm.runInNewContext() method to apply
      // configuration overrides. With this approach config object is used as an
      // evaluation context and as result none of the regular node module
      // variables (e.g. require, __dirname) are accessible.
      // This requires hacks as below to support path resolution. It should be
      // better to expose regular node module variables to the evaluation
      // scope without polluting the config object.
      _resolve: (name) => path.resolve(this.workDir, name)
    }

    this.lastRun = {
      error: null,
      stdout: '',
      stderr: ''
    }
  }

  updateConfig (configOverrides) {
    vm.runInNewContext(configOverrides, this.config)
  }

  writeConfigFile () {
    delete this.config._resolve

    const config = JSON.stringify(Object.assign({}, this.config, {
      customLaunchers: Object.assign({
        ChromeHeadlessNoSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox'] }
      }, this.config.customLaunchers)
    }))

    const content = `process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  config.set(${config});
};
`

    fs.writeFileSync(this.configFile, content)
  }

  ensureSandbox () {
    rimraf.sync(this.sandboxDir)
    mkdirp.sync(this.sandboxDir)
  }
}

setWorldConstructor(World)
