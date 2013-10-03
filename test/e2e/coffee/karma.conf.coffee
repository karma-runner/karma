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
      '**/*.coffee': 'coffee'

    reporters: ['dots']

    plugins: [
      'karma-jasmine'
      'karma-coffee-preprocessor'
      'karma-chrome-launcher'
      'karma-firefox-launcher'
    ]
