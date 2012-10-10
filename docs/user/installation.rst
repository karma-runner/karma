=======
Installation
=======

First, you need to install `Node.js`_. There are installers for both
Macintosh and Windows. On Linux, we recommend using `NVM`_.

.. code-block:: bash

  sudo npm install -g testacular

or install in a local folder (you have to create symlinks to binaries
on your own)

.. code-block:: bash

  npm install testacular

You can install Testacular even without NPM, just get the latest
package and create symlinks:

.. code-block:: bash

  # replace x.y.z with latest version
  curl http://registry.npmjs.org/testacular/-/testacular-x.y.z.tgz | tar -xv && mv package testacular

  # create symlinks (optional)
  cd testacular
  sudo ln -s $PWD/bin/testacular /usr/local/bin/testacular


.. _Node.js: http://nodejs.org
.. _NVM: https://github.com/creationix/nvm
