
module.exports = function (wallaby) {
  return {
    files: [
      {
        pattern: 'package.json',
        instrument: false
      },
      {
        pattern: 'config.tpl.js',
        instrument: false
      },
      {
        pattern: 'test/unit/certificates/server.key',
        instrument: false
      },
      {
        pattern: 'test/unit/certificates/server.crt',
        instrument: false
      },
      {
        pattern: 'test/unit/**/*.spec.js',
        ignore: true
      },
      'lib/**/*.js',
      'test/unit/**/*.js',
      'test/unit/mocha-globals.js'
    ],

    tests: [
      'test/unit/**/*.spec.js'
    ],

    bootstrap: function (w) {
      var path = require('path')
      var mocha = w.testFramework

      mocha.suite.on('pre-require', function () {
        // always passing wallaby.js globals to mocks.loadFile
        var mocks = require('mocks')
        var loadFile = mocks.loadFile
        mocks.loadFile = function (filePath, mocks, globals, mockNested) {
          mocks = mocks || {}
          globals = globals || {}
          globals.$_$wp = global.$_$wp || {}
          globals.$_$wpe = global.$_$wpe || {}
          globals.$_$w = global.$_$w || {}
          globals.$_$wf = global.$_$wf || {}
          globals.$_$tracer = global.$_$tracer || {}
          return loadFile(filePath, mocks, globals, mockNested)
        }

        // loading mocha-globals for each run
        require(path.join(process.cwd(), 'test/unit/mocha-globals'))
      })
    },

    env: {
      type: 'node',
      params: {
        runner: '--harmony --harmony_arrow_functions'
      }
    }
  }
}
