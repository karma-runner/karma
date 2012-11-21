==================
Configuration File
==================

To configure Testacular you use a configuration file and supply this
file when starting Testacular.
Here is a list of all possible configuration values that can be used,
including their default values.

.. object:: basePath (String)
  
  Base path, that will be used to resolve files and exclude.

  *Default.*  ``''``

.. object:: files (Array)

  List of files/patterns to load in the browser.

  *Default.*  ``[]``

.. object:: exclude (Array)

  List of files to exclude.

  *Default.*  ``[]``

.. object:: reporters (Array)

  A list of reporters to use.

  *Default.*  ``['progress']``

  *Possible Values.* 

  * ``dots``
  * ``progress``

.. object:: port (Number)

  Web server port

  *Default.*  ``8080``

.. object:: runnerPort (Number)
  
  Cli runner port

  *Default.*  ``9100``

.. object:: colors (Boolean)

  Enable / disable colors in the output (reporters and logs).

  *Default.*  ``true``

.. object:: logLevel (Constant)

  Level of logging.

  *Default.*  ``LOG_INFO``

  *Possible values.* 

  * ``LOG_DISABLE``
  * ``LOG_ERROR``
  * ``LOG_WARN``
  * ``LOG_INFO``
  * ``LOG_DEBUG`` 

.. object:: autoWatch (Boolean)

  Enable / disable watching file and executing tests whenever any file
  changes.

  *Default.* ``false``

.. object:: browsers (Array)

  A list of browsers to test in.

  *Default.* ``[]``

  *Possible Values.*

  * ``Chrome``
  * ``ChromeCanary``
  * ``Firefox``
  * ``Opera``
  * ``Safari``
  * ``PhantomJS``

.. object:: singleRun (Boolean)
  
  Continuous Integration mode if ``true``, it captures browsers, runs
  tests and exits.

  *Default.*  ``false``
  
