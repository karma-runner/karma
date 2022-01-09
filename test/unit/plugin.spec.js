'use strict'

const path = require('path')
const proxyquire = require('proxyquire')
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

  describe('resolve', () => {
    // Base path should be the same as the one produced by the code under test.
    const base = path.resolve(__dirname, '..', '..', '..')
    const directories = {
      [base]: ['karma-fancy-plugin', 'other-package', 'karma-powerful-plugin', 'yet-another-package', '@scope'],
      [path.join(base, '@scope')]: ['karma-super-plugin', 'not-a-plugin']
    }

    const { resolve } = proxyquire(
      '../../lib/plugin',
      {
        'graceful-fs': { readdirSync: (dir) => directories[dir] },
        'karma-fancy-plugin': { name: 'karma-fancy-plugin', '@noCallThru': true },
        'karma-powerful-plugin': { name: 'karma-powerful-plugin', '@noCallThru': true },
        '@scope/karma-super-plugin': { name: '@scope/karma-super-plugin', '@noCallThru': true },
        // Plugins are require()'d using an absolute path if they were resolved from the glob.
        [path.join(base, 'karma-fancy-plugin')]: { name: 'karma-fancy-plugin', '@noCallThru': true },
        [path.join(base, 'karma-powerful-plugin')]: { name: 'karma-powerful-plugin', '@noCallThru': true },
        [path.join(base, '@scope/karma-super-plugin')]: { name: '@scope/karma-super-plugin', '@noCallThru': true }
      }
    )

    it('loads simple plugin', () => {
      const modules = resolve(['karma-powerful-plugin'], null)

      expect(modules.map((m) => m.name)).to.deep.equal(['karma-powerful-plugin'])
    })

    it('loads scoped plugin', () => {
      const modules = resolve(['@scope/karma-super-plugin'], null)

      expect(modules.map((m) => m.name)).to.deep.equal(['@scope/karma-super-plugin'])
    })

    it('loads simple plugins with globs', () => {
      const modules = resolve(['karma-*'], null)

      expect(modules.map((m) => m.name)).to.deep.equal(['karma-fancy-plugin', 'karma-powerful-plugin'])
    })

    it('loads scoped plugins with globs', () => {
      const modules = resolve(['@*/karma-*'], null)

      expect(modules.map((m) => m.name)).to.deep.equal(['@scope/karma-super-plugin'])
    })
  })
})
