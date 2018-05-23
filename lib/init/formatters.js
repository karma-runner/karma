'use strict'

const path = require('path')
const FileUtils = require('../utils/file-utils')

function quote (value) {
  return `'${value}'`
}

function formatLine (items) {
  return items.map(quote).join(', ')
}

function formatMultiLines (items) {
  return items
    .map((file) => '\n      ' + file)
    .join(',')
}

function formatFiles (includedFiles, onlyServedFiles) {
  const lines = []
    .concat(includedFiles.map(quote))
    .concat(onlyServedFiles.map((file) => `{ pattern: ${quote(file)}, included: false }`))

  return formatMultiLines(lines)
}

function formatPreprocessors (preprocessors) {
  const lines = Object.keys(preprocessors)
    .map((pattern) => `${quote(pattern)}: [${formatLine(preprocessors[pattern])}]`)

  return formatMultiLines(lines)
}

function getConfigPath (file) {
  return path.join(__dirname, `/../../${file}`)
}

class JavaScriptFormatter {
  constructor () {
    this.TEMPLATE_FILE_PATH = getConfigPath('config.tpl.js')
    this.REQUIREJS_TEMPLATE_FILE = getConfigPath('requirejs.config.tpl.js')
  }

  generateConfigFile (answers) {
    const replacements = this.formatAnswers(answers)

    return FileUtils
      .readFile(this.TEMPLATE_FILE_PATH)
      .replace(/%(.*)%/g, (a, key) => replacements[key])
  }

  writeConfigFile (path, answers) {
    FileUtils.saveFile(path, this.generateConfigFile(answers))
  }

  writeRequirejsConfigFile (path) {
    FileUtils.copyFile(this.REQUIREJS_TEMPLATE_FILE, path)
  }

  formatAnswers (answers) {
    return {
      DATE: new Date(),
      BASE_PATH: answers.basePath,
      FRAMEWORKS: formatLine(answers.frameworks),
      FILES: formatFiles(answers.files, answers.onlyServedFiles),
      EXCLUDE: formatFiles(answers.exclude, []),
      AUTO_WATCH: answers.autoWatch ? 'true' : 'false',
      BROWSERS: formatLine(answers.browsers),
      PREPROCESSORS: formatPreprocessors(answers.preprocessors)
    }
  }
}

class CoffeeFormatter extends JavaScriptFormatter {
  constructor () {
    super()
    this.TEMPLATE_FILE_PATH = getConfigPath('config.tpl.coffee')
    this.REQUIREJS_TEMPLATE_FILE = getConfigPath('requirejs.config.tpl.coffee')
  }
}

class LiveFormatter extends JavaScriptFormatter {
  constructor () {
    super()
    this.TEMPLATE_FILE_PATH = getConfigPath('config.tpl.ls')
  }
}

class TypeFormatter extends JavaScriptFormatter {
  constructor () {
    super()
    this.TEMPLATE_FILE_PATH = getConfigPath('config.tpl.ts')
  }
}

exports.JavaScript = JavaScriptFormatter
exports.Coffee = CoffeeFormatter
exports.Live = LiveFormatter
exports.Type = TypeFormatter

exports.createForPath = function (path) {
  if (/\.coffee$/.test(path)) {
    return new CoffeeFormatter()
  }

  if (/\.ls$/.test(path)) {
    return new LiveFormatter()
  }

  if (/\.ts$/.test(path)) {
    return new TypeFormatter()
  }

  return new JavaScriptFormatter()
}
