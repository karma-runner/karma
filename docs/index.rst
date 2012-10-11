.. testacular documentation master file, created by
   sphinx-quickstart on Mon Oct  8 07:33:53 2012.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.



Testacular Documentation
========================

This is the documentation for the spectacular testacular project.


Content
#######

.. toctree:: 
  :maxdepth: 2


  self
  user
  developer



What is it good for?
###############

Mostly for testing code in multiple browsers (desktop, mobile, tablets):

* executing tests locally during development
* executing tests on a continuous integration server

Let's do it!
########

Go into your project and create a testacular configuration. Basically you need to specify the source files that you want to execute.

For an example configuration, see `test/client/testacular.conf.js`_ which
contains most of the options.

.. code-block:: bash

  # create config file (testacular.conf.js by default)
  testacular init
  
  # start server
  testacular start

  # open browsers you want to test (if testacular is not configured to do it for you)
  open http://localhost:8080

  # if you want to run tests manually (without auto watching file changes), you can:
  testacular run

Testing frameworks support
######################

Testacular is not a testing framework, neither an assertion library, so for that you can use pretty much anything you like.

However, we provide an adapter for Jasmine and Mocha.
If you wanna write an adapter for your favourite testing framework,
that's great - check out `adapter/jasmine.src.js`_ and write your own. 

Browsers Supported
###############

Please see :doc:`user/browsers` for details on supported Browsers and how to configure non-default paths.

Why am I doing this?
################

Throughout the development of `AngularJS`_, we've been using `JSTD`_ for testing. I really think that JSTD is a great idea. Unfortunately, we had many problems with JSTD, so we decided to write our own test runner based on the same idea. We wanted a simple tool just for executing JavaScript tests that is both stable and fast. That's why we use the awesome `Socket.io`_ library and `Node.js`_.



Contact
#################
There is a `mailing list`_ and an `issuetracker`_.  Also you can follow `@TestacularJS`_ as well.


Versions
#######

Testacular uses `Semantic Versioning`_. All even versions (eg. ``0.2.x``, ``0.4.x``) are considered to
be stable - no breaking changes, only bug fixes.

Stable channel (branch "stable")

.. code-block:: bash

  npm install -g testacular

Canary channel (branch "master")

.. code-block:: bash

  npm install -g testacular@canary

.. _Node.js: http://nodejs.org/
.. _AngularJS: http://angularjs.org/
.. _JSTD: http://code.google.com/p/js-test-driver/
.. _Socket.io: http://socket.io/
.. _NVM: https://github.com/creationix/nvm
.. _Grunt: http://gruntjs.com/
.. _Jasmine: http://pivotal.github.com/jasmine/
.. _Mocha: http://visionmedia.github.com/mocha/
.. _Semantic Versioning: http://semver.org/
.. _test/client/testacular.conf.js: https://github.com/vojtajina/testacular/blob/master/test/client/testacular.conf.js
.. _adapter/jasmine.src.js: https://github.com/vojtajina/testacular/blob/master/adapter/jasmine.src.js
.. _@TestacularJS: http://twitter.com/TestacularJS
.. _mailing list: https://groups.google.com/forum/#!forum/testacular
.. _issuetracker: https://github.com/vojtajina/testacular/issues
