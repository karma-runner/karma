'use strict'

const NetUtils = require('../../../lib/utils/net-utils')
const connect = require('connect')
const net = require('net')

describe('NetUtils.isPortAvailable', () => {
  it('it is possible to run server on available port', (done) => {
    NetUtils.isPortAvailable(9876, '127.0.0.1').then((available) => {
      expect(available).to.be.true
      const server = net
        .createServer(connect())
        .listen(9876, '127.0.0.1', () => {
          server.close(done)
        })
    })
  })

  it('resolves with false when port is used', (done) => {
    const server = net
      .createServer(connect())
      .listen(9876, '127.0.0.1', () => {
        NetUtils.isPortAvailable(9876, '127.0.0.1').then((available) => {
          expect(available).to.be.false
          server.close(done)
        })
      })
  })
})

describe('NetUtils.getAvailablePort', () => {
  it('resolves with port when is available', (done) => {
    NetUtils.getAvailablePort(9876, '127.0.0.1').then((port) => {
      expect(port).to.equal(9876)
      done()
    })
  })

  it('resolves with next available port', (done) => {
    const stub = sinon.stub(NetUtils, 'isPortAvailable')
    stub.withArgs(9876).resolves(false)
    stub.withArgs(9877).resolves(false)
    stub.withArgs(9878).resolves(true)

    NetUtils.getAvailablePort(9876, '127.0.0.1').then((port) => {
      expect(port).to.equal(9878)
      done()
    })
  })
})
