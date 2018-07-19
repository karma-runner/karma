'use strict'

const BundleUtils = require('../../../lib/utils/bundle-utils')
const PathUtils = require('../../../lib/utils/path-utils')
const FileUtils = require('../../../lib/utils/file-utils')
const fs = require('fs')

const sandbox = sinon.sandbox.create()

describe('BundleUtils.bundleResource', () => {
  beforeEach(() => FileUtils.removeFileIfExists(PathUtils.calculateAbsolutePath('test/unit/fixtures/bundled.js')))

  it('create bundle file in requested output path', (done) => {
    BundleUtils.bundleResource('test/unit/fixtures/format-error-root.js', 'test/unit/fixtures/bundled.js')
      .then(() => {
        expect(fs.existsSync(PathUtils.calculateAbsolutePath('test/unit/fixtures/bundled.js'))).to.be.true
        done()
      })
  }).timeout(5000)
})

describe('BundleUtils.bundleResourceIfNotExist', () => {
  beforeEach(() => {
    sandbox.stub(BundleUtils, 'bundleResource').resolves()
  })

  afterEach(() => sandbox.restore())

  it('bundle resource when output path file not exists', () => {
    sandbox.stub(fs, 'existsSync').returns(false)

    BundleUtils.bundleResourceIfNotExist('context/main.js', 'static/context.js')
    expect(BundleUtils.bundleResource).to.have.been.called
  })

  it('does not bundle resource when output path file exists', () => {
    sandbox.stub(fs, 'existsSync').returns(true)

    BundleUtils.bundleResourceIfNotExist('context/main.js', 'static/context.js')
    expect(BundleUtils.bundleResource).to.not.have.been.called
  })
})
