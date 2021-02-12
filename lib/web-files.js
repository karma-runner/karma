/**
  Container class for the files included in context.html and served upon
  request. Two instances fit into the files pipeline:
    1. The result from FileList.files, the list of preprocessed input files.
    2. The result of bundling #1 stored in currentWebFiles
*/
class WebFiles {
  constructor (included, served) {
    this.included = [...included]
    this.served = [...served]
  }
}

let currentWebFiles = new WebFiles([], [])

function noOpBundler (webFiles) {
  return new WebFiles(webFiles.included, webFiles.served)
}

let bundler = noOpBundler

function registerBundler (emitter) {
  emitter.on('file_list_modified', (modifiedWebFiles) => {
    // Any bundler is expected to return a WebFiles object.
    // For sourcemap support, //# sourceUrl in the bundler result should
    // point back to the input files.
    currentWebFiles = Object.assign(currentWebFiles, bundler(modifiedWebFiles))
    emitter.emit('web_files_modified', currentWebFiles)
  })
}

function createWebFiles (configBundler, instantiatePlugin, emitter) {
  if (configBundler) {
    bundler = instantiatePlugin('bundler', configBundler)
  }
  registerBundler(emitter)
  return currentWebFiles
}

createWebFiles.$inject = ['config.bundler', 'instantiatePlugin', 'emitter']

module.exports = {
  createWebFiles,
  WebFiles
}
