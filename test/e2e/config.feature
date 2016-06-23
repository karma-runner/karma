@current
Feature: Basic Testrunner
  In order to use Karma
  As a person who wants to write great tests
  I want to be able to write my config file in different styles

  Scenario: Configuration in CoffeeScript
    Given a raw configuration with extension "coffee":
      """
      module.exports = (config) =>
        config.set({
          files: ['basic/plus.js', 'basic/test.js']
          browsers: ['PhantomJS']
          plugins: [
            'karma-jasmine'
            'karma-phantomjs-launcher'
          ]
        })
      """
    When I start Karma
    Then it passes with:
      """
      ..
      PhantomJS
      """
  Scenario: Configuration with babel
    Given a raw configuration with extension "babel.js":
      """
      export default function (config) {
        config.set({
          files: ['basic/plus.js', 'basic/test.js'],
          browsers: ['PhantomJS'],
          plugins: [
            'karma-jasmine',
            'karma-phantomjs-launcher'
          ]
        })
      }
      """
    When I start Karma
    Then it passes with:
      """
      ..
      PhantomJS
      """
