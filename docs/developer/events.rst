Events
=====


.. function:: browser_register(browser)

  Browser sent name and id.

  :param browser: 
  :type browser: Browser


.. function:: browser_complete(browser)

  Browser completed an execution run. (All tests were executed/skipped or 
  browser disconnected). 

  :param browser: 
  :type browser: Browser


.. function:: browser_error(browser, error)

  Browser sent error (probably syntax error during loading).

  :param browser: 
  :type browser: Browser
  :param error:
  :type error: Error


.. function:: browser_dump(browser, dump)

  Browser sent dump.

  :param browser: 
  :type browser: Browser
  :param dump:
  :type dump: Object

.. function:: browsers_change(collection)

  Collection of captured browsers changed:

  - new browser
  - browser disconnected
  - browser changed status


  :param collection: 
  :type collection: Object

.. function:: spec_complete(browser, result)

  Single spec completed.

  :param browser: 
  :type browser: Browser
  :param result:
  :type result: Object


.. function:: run_start(collection)

  Starting new execution run.

  :param collection: 
  :type collection: Object

.. function:: run_complete(collection)

  Whole execution run finished (all browsers finished).

  :param collection: 
  :type collection: Object

