Client - Server protocol (socket.io events)
==========================

Server -> Client protocol
####################


.. function:: execute([config])

  :param config: Optional configuration object, will be passed to ``start()``
  :type config: Object

.. function:: info

  :returns: Information about all captured browsers
  :rtype: Array

Client -> Server protocol
####################

.. function register(info)

  :param info: Object containing `name` and `id` (if auto-launched) of the browser.
  :type info: Object

.. function:: info

  :returns: Object with information (i.e. browser name)
  :rtype: Object

.. function:: result

  :returns: Result object
  :rtype: Object

.. function:: error

.. function:: complete
