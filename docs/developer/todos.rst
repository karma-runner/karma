ToDos
=====

Features
########




Reporters
--------

* Growl
* TAP (`Test Anything Protocol <http://en.wikipedia.org/wiki/Test_Anything_Protocol>`_)


Preprocessors
------------

* Browserify
* JSHint


Console Dashboard
----------------
  
* captured client status
* captured browsers
* stats - which browsers are captured (expose as html, served by server)
* control the configuration from dashboard (change log level for example)

Make design more extensible
-----------------------

* allow server/client plugins, passing configuration to plugins (like jasmine - test only last failed)
* hookable events
* allow server side module to handle results (allow hookable modules on both server, client sides)

Misc
-----

* Code coverage see `Issue #89 <https://github.com/vojtajina/testacular/issues/89>`_
* disable console - option to completely disable console (to disable leaking)
* make global event emitter (+ instantiate(Class) that would register listeners)
* opera, ff - angular
* server -> runner general format, so that it can use different reporter ?)
* jsdom execution
* file preprocessing
* prefetching files (when browser capture)
* execution on server as well
* pluginability (hookable system) - 
* flexible file loader - which files should be run (wildchars, include/exclude, function ?)
* refresh only some files ? (is it possible to be stable ?)
* ?should we care about dependencies - when reloading, reload all depended files
* use framework (module) for static file serving? (https://github.com/joyent/node/wiki/modules#wiki-web-frameworks-static)
* debugging ? breakpoints (node, browser)
* make server daemon ?
* run on only available clients ? (if one is executing previous run)
* using tab instead of iframe, using frames ?
* more granularity during execution (continuous info about tests)
* allow passing configuration into client (both config, test run params)
* interesting modules: https://github.com/joyent/node/wiki/modules
* underscore
* !!! jsdom
* check for global state polution ?
* allow/ not allow page reload (navigation)
* E2E TESTS:

  - disconnects browser during run
  - reconnect browser
  - disconnect server + reconnect
  - all tests passed / failures
  - syntax error

Issues
#####

* WebStorm issues:

  * terminal escaping

* handle - Chrome's script causes too much memory message ?
* util.js:24 replace of null






