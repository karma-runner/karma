'use strict'

const fs = require('graceful-fs')
const path = require('path')
const _ = require('lodash')
const mm = require('minimatch')

const extractUAParts = (ua) => {
  const result = {}
  if (ua) {
    // general format is: Thing1/Version.1 Thing 2/Version.2 (detailA; detailB)
    const partPattern = /(\w[\w_ ]*)\/([^ ]+)(?: \(([^)]+)\) *| (?!\()|$)/g

    for (const [, name, version, bracketed] of ua.matchAll(partPattern)) {
      const details = (bracketed || '').split(/; */g).filter((x) => x)
      const key = name.toLowerCase().replace(/ /g, '_')
      if (!result[key]) { // use first occurrence, and prevent __proto__ changes, etc.
        result[key] = {
          version,
          details,
          hasDetail: (test) => details.some((v) => test.exec(v)),
          getDetail: (test, mapper) => {
            const found = details.map((v) => test.exec(v)).filter((x) => x)[0]
            if (mapper) {
              return found ? mapper(found) : null
            }
            return found || []
          }
        }
        // lots of checks look at the details of the first entry, which is
        // usually 'Mozilla', but not always (e.g. 'Opera'),
        // so record the first entry separately:
        if (!result.firstEntry) {
          result.firstEntry = result[key]
        }
      }
    }
  }
  if (!result.firstEntry) {
    // ensure firstEntry is always set no matter what (null object pattern)
    result.firstEntry = {
      version: null,
      details: [],
      hasDetail: () => false,
      getDetail: () => []
    }
  }
  return result
}

const extractFromParts = (parts, checks) => checks
  .map((check) => check(parts))
  .filter((result) => result)[0] || []

const extractMacVersion = (m) => m[1].replace(/_/g, '.')

const WINDOWS_NT_VERSION_MAP = {
  5.1: 'XP',
  5.2: 'XP',
  '6.0': 'Vista',
  6.1: '7',
  6.2: '8',
  6.3: '8.1',
  6.4: '10',
  '10.0': '10'
}
const extractWindowsVersion = (m) => WINDOWS_NT_VERSION_MAP[m[1]]

const UA_BROWSERS = [
  ({ phantomjs }) => phantomjs && // also contains Safari
    ['PhantomJS', phantomjs.version],

  ({ headlesschrome }) => headlesschrome && // also contains Safari
    ['Chrome Headless', headlesschrome.version],

  ({ opera, version }) => opera &&
    ['Opera', version && version.version],

  ({ firefox }) => firefox &&
    ['Firefox', firefox.version],

  ({ edg }) => edg && // also contains Chrome, Safari
    ['Edge', edg.version],

  ({ chrome }) => chrome && // also contains Safari
    ['Chrome', chrome.version],

  ({ firstEntry, version }) => firstEntry.hasDetail(/^iphone/i) && // also contains Safari
    ['Mobile Safari', version && version.version],

  ({ firstEntry, version }) => firstEntry.hasDetail(/^android/i) && // also contains Safari
    ['Android Browser', version && version.version],

  ({ safari, version }) => safari &&
    ['Safari', version && version.version],

  ({ firstEntry }) => firstEntry.hasDetail(/^msie/i) &&
    ['IE', firstEntry.getDetail(/^msie ([\d.]+)/i)[1]]
]

const UA_SYSTEMS = [
  ({ firstEntry }) => firstEntry.hasDetail(/^android/i) &&
    ['Android', firstEntry.getDetail(/^android ([\d.]+)/i)[1]],

  ({ firstEntry }) => firstEntry.hasDetail(/^iphone/i) &&
    ['iOS', firstEntry.getDetail(/iphone os ([\d._]+)/i, extractMacVersion)],

  ({ ubuntu }) => ubuntu &&
    ['Ubuntu', ubuntu.version],

  ({ firstEntry }) => firstEntry.hasDetail(/^freebsd/i) &&
    ['FreeBSD', null],

  ({ firstEntry }) => firstEntry.hasDetail(/^linux/i) &&
    ['Linux', firstEntry.getDetail(/^linux (.+)/i)[1]],

  ({ firstEntry }) => firstEntry.hasDetail(/mac os/i) &&
    ['Mac OS', firstEntry.getDetail(/mac os(?: x)? ([\d._]+)/i, extractMacVersion)],

  ({ firstEntry }) => firstEntry.hasDetail(/^windows/i) &&
    ['Windows', firstEntry.getDetail(/windows nt ([\d.]+)/i, extractWindowsVersion)]
]

exports.browserFullNameToShort = (fullName) => {
  const parts = extractUAParts(fullName)
  const [browserName, browserVersion] = extractFromParts(parts, UA_BROWSERS)
  const [osName, osVersion] = extractFromParts(parts, UA_SYSTEMS)
  if (browserName || osName) {
    return `${browserName || 'unknown'} ${browserVersion || '0.0.0'} (${osName || 'unknown'} ${osVersion || '0.0.0'})`
  }
  return fullName || 'unknown'
}

exports.isDefined = (value) => {
  return !_.isUndefined(value)
}

const parser = (pattern, out) => {
  if (pattern.length === 0) return out
  const p = /^(\[[^\]]*\]|[*+@?]\((.+?)\))/g
  const matches = p.exec(pattern)
  if (!matches) {
    const c = pattern[0]
    let t = 'word'
    if (c === '*') {
      t = 'star'
    } else if (c === '?') {
      t = 'optional'
    }
    out[t]++
    return parser(pattern.substring(1), out)
  }
  if (matches[2] !== undefined) {
    out.ext_glob++
    parser(matches[2], out)
    return parser(pattern.substring(matches[0].length), out)
  }
  out.range++
  return parser(pattern.substring(matches[0].length), out)
}

const gsParser = (pattern, out) => {
  if (pattern === '**') {
    out.glob_star++
    return out
  }
  return parser(pattern, out)
}

const compareWeightObject = (w1, w2) => {
  return exports.mmComparePatternWeights(
    [w1.glob_star, w1.star, w1.ext_glob, w1.range, w1.optional],
    [w2.glob_star, w2.star, w2.ext_glob, w2.range, w2.optional]
  )
}

exports.mmPatternWeight = (pattern) => {
  const m = new mm.Minimatch(pattern)
  if (!m.globParts) return [0, 0, 0, 0, 0, 0]
  const result = m.globParts.reduce((prev, p) => {
    const r = p.reduce((prev, p) => {
      return gsParser(p, prev)
    }, { glob_star: 0, ext_glob: 0, word: 0, star: 0, optional: 0, range: 0 })
    if (prev === undefined) return r
    return compareWeightObject(r, prev) > 0 ? r : prev
  }, undefined)
  result.glob_sets = m.set.length
  return [result.glob_sets, result.glob_star, result.star, result.ext_glob, result.range, result.optional]
}

exports.mmComparePatternWeights = (weight1, weight2) => {
  const n1 = weight1[0]
  const n2 = weight2[0]
  const diff = n1 - n2
  if (diff !== 0) return diff / Math.abs(diff)
  return weight1.length > 1 ? exports.mmComparePatternWeights(weight1.slice(1), weight2.slice(1)) : 0
}

exports.isFunction = _.isFunction
exports.isString = _.isString
exports.isObject = _.isObject
exports.isArray = _.isArray
exports.isNumber = _.isNumber

const ABS_URL = /^https?:\/\//
exports.isUrlAbsolute = (url) => {
  return ABS_URL.test(url)
}

exports.camelToSnake = (camelCase) => {
  return camelCase.replace(/[A-Z]/g, (match, pos) => {
    return (pos > 0 ? '_' : '') + match.toLowerCase()
  })
}

exports.ucFirst = (word) => {
  return word.charAt(0).toUpperCase() + word.substr(1)
}

exports.dashToCamel = (dash) => {
  const words = dash.split('-')
  return words.shift() + words.map(exports.ucFirst).join('')
}

exports.arrayRemove = (collection, item) => {
  const idx = collection.indexOf(item)

  if (idx !== -1) {
    collection.splice(idx, 1)
    return true
  }

  return false
}

exports.merge = function () {
  const args = Array.prototype.slice.call(arguments, 0)
  args.unshift({})
  return _.merge.apply({}, args)
}

exports.formatTimeInterval = (time) => {
  const mins = Math.floor(time / 60000)
  const secs = (time - mins * 60000) / 1000
  let str = secs + (secs === 1 ? ' sec' : ' secs')

  if (mins) {
    str = mins + (mins === 1 ? ' min ' : ' mins ') + str
  }

  return str
}

const replaceWinPath = (path) => {
  return _.isString(path) ? path.replace(/\\/g, '/') : path
}

exports.normalizeWinPath = process.platform === 'win32' ? replaceWinPath : _.identity

exports.mkdirIfNotExists = (directory, done) => {
  // TODO(vojta): handle if it's a file
  /* eslint-disable handle-callback-err */
  fs.stat(directory, (err, stat) => {
    if (stat && stat.isDirectory()) {
      done()
    } else {
      exports.mkdirIfNotExists(path.dirname(directory), () => {
        fs.mkdir(directory, done)
      })
    }
  })
  /* eslint-enable handle-callback-err */
}

exports.defer = () => {
  let res
  let rej
  const promise = new Promise((resolve, reject) => {
    res = resolve
    rej = reject
  })

  return {
    resolve: res,
    reject: rej,
    promise: promise
  }
}

exports.saveOriginalArgs = (config) => {
  if (config && config.client && config.client.args) {
    config.client.originalArgs = _.cloneDeep(config.client.args)
  }
}

exports.restoreOriginalArgs = (config) => {
  if (config && config.client && config.client.originalArgs) {
    config.client.args = _.cloneDeep(config.client.originalArgs)
  }
}
