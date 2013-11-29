module.exports = (config) ->
  config.set
    frameworks: ['jasmine']

    files: [
      '*.coffee'
    ]

    autoWatch: true

    browsers: [if process.env.TRAVIS then 'Firefox' else 'Chrome']

    coffeePreprocessor:
      options:
        sourceMap: true

    preprocessors:
      'plus.coffee': 'coverage'
      'test.coffee': 'coffee'

    reporters: ['dots', 'coverage']

    plugins: [
      'karma-jasmine'
      'karma-coffee-preprocessor'
      'karma-chrome-launcher'
      'karma-firefox-launcher',
      'karma-coverage'
    ]
