# Client - Server protocol (socket.io events)

## Server -> Client protocol

### execute

* {Object=} config Optional configuration object, will be passed to start()

### info

* {Array} info Info about all captured browsers

## Client -> Server protocol

### register

* {Object} info Object containing `name` and `id` (if auto-launched) of the browser.

### info

* {Object} info Object with info (i.e. browser name)

### result

* {Object} result Result object

### error

### complete
