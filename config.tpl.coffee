# Karma configuration
# Generated on %DATE%

module.exports = (config) ->
  config.set

    # base path, that will be used to resolve all patterns, eg. files, exclude
    basePath: '%BASE_PATH%'

    # frameworks to use
    frameworks: [%FRAMEWORKS%]

    # list of files / patterns to load in the browser
    files: [
      %FILES%
    ]

    # list of files to exclude
    exclude: [
      %EXCLUDE%
    ]

    # test results reporter to use
    # possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress']

    # web server port
    port: 9876

    # enable / disable colors in the output (reporters and logs)
    colors: true

    # level of logging
    # possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO

    # enable / disable watching file and executing tests whenever any file changes
    autoWatch: %AUTO_WATCH%

    # Start these browsers, currently available:
    # - Chrome
    # - ChromeCanary
    # - Firefox
    # - Opera
    # - Safari (only Mac)
    # - PhantomJS
    # - IE (only Windows)
    browsers: [%BROWSERS%]

    # If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000

    # Continuous Integration mode
    # if true, it capture browsers, run tests and exit
    singleRun: false
