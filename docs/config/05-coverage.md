Testacular can generate code coverage using awesome [Istanbul].
If you want to generate the coverage, you need to configure up to three parts:

* preprocessor `coverage` (required)
* reporter `coverage` (required)
* reporter options (optional)


## Preprocessor
The preprocessor configures which files should be tested for coverage.
For example if all your code lives in ``lib/`` you need to add this to your
configuration file.

```javascript
preprocessors = {
  '**/lib/*.js': 'coverage'
};
```
You should not however include the files that aren't directly related to your
program, e.g. libraries, mocks, neither tests.

This is a **BAD** example

```javascript
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'lib/*.js',
  'test/*.js'
];
preprocessors = {
  '**/*.js': 'coverage'
};
```
In this example also JASMINE and JASMINE_ADAPTER get included but they shouldn't as
these file are only for the test setup used and not for your program.

If you include these files there can occur side effects like the following,

* a part of the code coverage report will be output in the installation directory of testacular.
* the code coverage rate is reduced unfairly.

## Reporter
To activate the coverage reporter add this to your configuration file.
```javascript
reporters = ['coverage'];
```
This will create a coverage report for every browser that the tests are run in.
In addition, it will create a JSON file that outputs the intermediate data.


##  Reporter Options
The reporter defaults to the following values.

```javascript
coverageReporter = {
  type : 'html',
  dir : 'coverage/'
}
```
If you want to configure it yourself here are the options explained.

### type
**Type:** String

**Possible Values:**
  * `html` (default)
  * `lcov` (lcov and html)
  * `lcovonly`
  * `text`
  * `text-summary`
  * `cobertura` (xml format supported by Jenkins)

If you set `type` to `text` or `text-summary`, you may set the `file` option, like this.
```javascript
coverageReporter = {
  type : 'text',
  dir : 'coverage/',
  file : 'coverage.txt'
}
```
If no filename is given, it will write the output to the console.

### dir
**Type:** String

**Description:** This will be used to output coverage reports. When
  you set a relative path, the directory is resolved against the `basePath`.



[Istanbul]: https://github.com/yahoo/istanbul
