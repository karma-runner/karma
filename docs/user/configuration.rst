Configuration
=========

These are the possible configuration values for ``testacular.conf.js``.

.. object:: basePath (String)
  
  Base path, that will be used to resolve files and exclude.

.. object:: files (Array)

  List of files/patterns to load in the browser.

.. object:: exclude (Array)

  List of files to exclude.
.. object:: reporter (String)

  Test results reporter to use. Possible values: ``dots`` or  ``progress``

.. object:: port (Number)

  Web server port

.. object:: runnerPort (Number)
  
  Cli runner port

.. object:: colors (Boolean)

  Enable / disable colors in the output (reporters and logs).

.. object:: logLevel (Constant)

  Level of logging.
  Possible values: ``LOG_DISABLE``, ``LOG_ERROR``, ``LOG_WARN``, ``LOG_INFO``, ``LOG_DEBUG``

.. object:: autoWatch (Boolean)

  Enable / disable watching file and executing tests whenever any file changes.

.. object:: browsers (Array)

  Start these browsers. Possible values

  * ``Chrome``
  * ``ChromeCanary``
  * ``Firefox``
  * ``Opera``
  * ``Safari``
  * ``PhantomJS``

.. object:: singleRun (Boolean)
  
  Continuous Integration mode if ``true``, it captures browsers, run tests and exit
  
