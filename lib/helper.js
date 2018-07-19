'use strict'

const fs = require('graceful-fs')
const path = require('path')
const _ = require('lodash')
const useragent = require('useragent')
const Promise = require('bluebird')
const mm = require('minimatch')

exports.browserFullNameToShort = (fullName) => {
  const agent = useragent.parse(fullName)
  const isKnown = agent.family !== 'Other' && agent.os.family !== 'Other'
  return isKnown ? agent.toAgent() + ' (' + agent.os + ')' : fullName
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
    }, {glob_star: 0, ext_glob: 0, word: 0, star: 0, optional: 0, range: 0})
    if (prev === undefined) return r
    return compareWeightObject(r, prev) > 0 ? r : prev
  }, undefined)
  result.glob_sets = m.set.length
  return [result.glob_sets, result.glob_star, result.star, result.ext_glob, result.range, result.optional]
}

exports.mmComparePatternWeights = (weight1, weight2) => {
  let n1, n2, diff
  n1 = weight1[0]
  n2 = weight2[0]
  diff = n1 - n2
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
