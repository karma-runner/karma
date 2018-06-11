'use strict'

const Promise = require('bluebird')
const net = require('net')

const NetUtils = {
  isPortAvailable (port, listenAddress) {
    return new Promise((resolve, reject) => {
      const server = net.createServer()

      server.unref()
      server.on('error', (err) => {
        server.close()
        if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
          resolve(false)
        } else {
          reject(err)
        }
      })

      server.listen(port, listenAddress, () => {
        server.close(() => resolve(true))
      })
    })
  },

  getAvailablePort (port, listenAddress) {
    return NetUtils.isPortAvailable(port, listenAddress)
      .then((available) => available ? port : NetUtils.getAvailablePort(port + 1, listenAddress))
  }
}

module.exports = NetUtils
