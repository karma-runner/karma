module.exports = (config) ->
  config.set do
    frameworks: ['jasmine']

    files: [
      '*.ls'
    ]

    autoWatch: true

    browsers: [if process.env.TRAVIS then 'Firefox' else 'Chrome']

    preprocessors:
      '**/*.ls': 'live'

    reporters: ['dots']

    plugins: [
      'karma-jasmine'
      'karma-live-preprocessor'
      'karma-chrome-launcher'
      'karma-firefox-launcher'
    ]
