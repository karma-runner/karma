===================
More about Browsers
===================

Capturing browsers is kinda boring, so Testacular can do that for you. Just simply add into the configuration file:

.. code-block:: javascript

  browsers = ['Chrome'];

Then, Testacular will take care of autocapturing these browsers, as well as killing them.

Available browsers:

- Chrome
- ChromeCanary
- Safari
- Firefox
- Opera
- PhantomJS


Correct path to browser binary
###############################
Testacular has some default paths, where to find these browsers.
Check out `launcher`_ to see them. 

You can override these settings by ``<BROWSER>_BIN`` env variable.

.. code-block:: bash

    # Example - changing path to Chrome binary:
    $ export CHROME_BIN=/usr/local/bin/my-chrome-build

Or just create symlink.

Custom browsers - example from AngularJS's CI server binary
############################################################

.. code-block:: javascript

  // put this into configuration file
  var BaseBrowser = require('testacular').launcher.BaseBrowser;
  var IE8 = function() {
    BaseBrowser.apply(this, arguments);
    this.name = 'IE8';
    this.DEFAULT_CMD = {
      darwin: '/custom/script/to/start/ie8-on-vm.sh'
    };
  };

  browsers = ['Chrome', IE8];


.. _launcher: https://github.com/vojtajina/testacular/blob/master/lib/launcher.js
