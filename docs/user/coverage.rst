Code Coverage
========================

Testacular settings for code coverage, which is constituted by 3 parts.

* Reporter (required)
* Preprocessor (required)
* Reporter Options (not required)

Reporter
########################
Coverage report comes to be outputted by this configuration.

.. code-block:: javascript

  reporters = ['coverage'];

Coverage report is output for each browser.

In addition, JSON file that is used to generate a report is output as intermediate data.

Preprocessor
########################
instrument code for coverage by this configuration.
this means that JS parsing and code generation.

.. code-block:: javascript

  preprocessors = {
    '**/coverage/lib/*.js': 'coverage'
  };

Please set focused enough JavaScript to be.


You should not include the JavaScript that does not exist in the following basePath.


I will show a **bad** example below.

.. code-block:: javascript

  files = [
    JASMINE,
    JASMINE_ADAPTER,
    'lib/*.js',
    'test/*.js'
  ];
  preprocessors = {
    '**/*.js': 'coverage'
  };

In this example, it is include to JASMINE and JASMINE_ADAPTER.

There should not to be include to the instrument, because there javascripts are embedded in the testacular.

This effect occurs when two bad.

* a part of code coverage report will be output in the installation directory of testacular.
* code coverage rate is reduced unfairly.

Even for processing does not contain all the JavaScript basePath below,

Because they want to have code coverage situation assumed to exist and is now in this specification.

Reporter Options
########################

Default value is below.

.. code-block:: javascript

  coverageReporter = {
    type : 'html',
    dir : 'coverage/'
  }

.. object:: type (String)

  Available types:
  
  - html (default)
  - lcov (lcov and html)
  - lcovonly
  - text
  - text-summary

  if you set 'text' or 'text-summary' to type, you may use 'file' option.
  
  like the below.
  
  .. code-block:: javascript
  
    coverageReporter = {
      type : 'text',
      dir : 'coverage/',
      file : 'coverage.txt'
    }
  
  the filename for the report. When omitted, the report is written to console.


.. object:: dir (String)

  dir will be used to output coverage reports.
  when you set relative path, that directory is made under basePath.
