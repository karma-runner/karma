# Karma configuration
# Generated on %DATE%

module.exports = (config) ->
  config.set

    # base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '%BASE_PATH%'


    # frameworks to use
    # available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: [%FRAMEWORKS%]


    # list of files / patterns to load in the browser
    files: [%FILES%
    ]


    # list of files / patterns to exclude
    exclude: [%EXCLUDE%
    ]


    # preprocess matching files before serving them to the browser
    # available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {%PREPROCESSORS%
    }


    # test results reporter to use
    # possible values: 'dots', 'progress'
    # available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress']


    # web server port
    port: 9876


    # enable / disable colors in the output (reporters and logs)
    colors: true


    # level of logging
    # possible values:
    # - config.LOG_DISABLE
    # - config.LOG_ERROR
    # - config.LOG_WARN
    # - config.LOG_INFO
    # - config.LOG_DEBUG
    logLevel: config.LOG_INFO


    # enable / disable watching file and executing tests whenever any file changes
    autoWatch: %AUTO_WATCH%


    # start these browsers
    # available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: [%BROWSERS%]


    # Continuous Integration mode
    # if true, Karma captures browsers, runs the tests and exits
    singleRun: false

    # Concurrency level
    # how many browser instances should be started simultaneously
    concurrency: Infinity
