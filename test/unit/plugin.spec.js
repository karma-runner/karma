'use strict'

const createInstantiatePlugin = require('../../lib/plugin').createInstantiatePlugin

describe('plugin', () => {
  describe('createInstantiatePlugin', () => {
    it('creates the instantiatePlugin function', () => {
      const fakeGet = sinon.stub()
      const fakeInjector = { get: fakeGet }

      expect(typeof createInstantiatePlugin(fakeInjector)).to.be.equal('function')
      expect(fakeGet).to.have.been.calledWith('emitter')
    })

    it('creates the instantiatePlugin function', () => {
      const fakes = {
        emitter: { emit: sinon.stub() }
      }
      const fakeInjector = { get: (id) => fakes[id] }

      const instantiatePlugin = createInstantiatePlugin(fakeInjector)
      expect(typeof instantiatePlugin('kind', 'name')).to.be.equal('undefined')
      expect(fakes.emitter.emit).to.have.been.calledWith('load_error', 'kind', 'name')
    })

    it('caches plugins', () => {
      const fakes = {
        emitter: { emit: sinon.stub() },
        'kind:name': { my: 'plugin' }
      }
      const fakeInjector = {
        get: (id) => {
          return fakes[id]
        }
      }

      const instantiatePlugin = createInstantiatePlugin(fakeInjector)
      expect(instantiatePlugin('kind', 'name')).to.be.equal(fakes['kind:name'])
      fakeInjector.get = (id) => { throw new Error('failed to cache') }
      expect(instantiatePlugin('kind', 'name')).to.be.equal(fakes['kind:name'])
    })

    it('errors if the injector errors', () => {
      const fakes = {
        emitter: { emit: sinon.stub() }
      }
      const fakeInjector = {
        get: (id) => {
          if (id in fakes) {
            return fakes[id]
          }
          throw new Error('fail')
        }
      }

      const instantiatePlugin = createInstantiatePlugin(fakeInjector)
      expect(typeof instantiatePlugin('unknown', 'name')).to.be.equal('undefined')
      expect(fakes.emitter.emit).to.have.been.calledWith('load_error', 'unknown', 'name')
    })
  })
})
