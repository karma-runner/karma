const createWebFiles = require('../../lib/web-files').createWebFiles

describe('WebFiles', () => {
  it('are created', () => {
    const mockConfigBundler = undefined
    const mockInstantiatePlugin = sinon.stub()
    const mockEmitter = { on: () => {} }
    const currentWebFiles = createWebFiles(mockConfigBundler, mockInstantiatePlugin, mockEmitter)
    expect(currentWebFiles.included).to.be.deep.equal([])
    expect(currentWebFiles.served).to.be.deep.equal([])
    expect(mockInstantiatePlugin).not.to.be.called
  })

  it('are updated', () => {
    const mockConfigBundler = undefined
    const mockInstantiatePlugin = sinon.stub()
    const mockModifiedWebFiles = { included: ['foo.js'], served: ['bar.js'] }

    let actualCallback
    const mockEmitter = {
      on: (eventName, callback) => {
        expect(eventName).to.be.equal('file_list_modified')
        actualCallback = callback
      },
      emit: (eventName, wf) => {
        expect(eventName).to.be.equal('web_files_modified')
        expect(wf).to.be.deep.equal(mockModifiedWebFiles)
      }
    }
    const currentWebFiles = createWebFiles(mockConfigBundler, mockInstantiatePlugin, mockEmitter)

    actualCallback(mockModifiedWebFiles)

    expect(currentWebFiles.included).to.be.deep.equal(['foo.js'])
    expect(currentWebFiles.served).to.be.deep.equal(['bar.js'])
    expect(mockInstantiatePlugin).not.to.be.called
  })

  it('are bundled', () => {
    const mockConfigBundler = 'mockBundler'
    const mockModifiedWebFiles = { included: ['foo.js'], served: ['bar.js'] }
    const mockBundledWebFiles = { included: ['bundled_foo.js'], served: ['bar.js'] }
    const mockInstantiatePlugin = (kind, name) => {
      expect(kind).to.be.equal('bundler')
      expect(name).to.be.equal('mockBundler')
      return (wf) => mockBundledWebFiles
    }

    let actualCallback
    const mockEmitter = {
      on: (eventName, callback) => {
        expect(eventName).to.be.equal('file_list_modified')
        actualCallback = callback
      },
      emit: (eventName, wf) => {
        expect(eventName).to.be.equal('web_files_modified')
        expect(wf).to.be.deep.equal(mockBundledWebFiles)
      }
    }
    // Model server startup
    const currentWebFiles = createWebFiles(mockConfigBundler, mockInstantiatePlugin, mockEmitter)

    // Model preprocessing complete
    actualCallback(mockModifiedWebFiles)

    expect(currentWebFiles.included).to.be.deep.equal(['bundled_foo.js'])
    expect(currentWebFiles.served).to.be.deep.equal(['bar.js'])
  })
})
