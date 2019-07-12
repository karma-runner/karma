'use strict'

const glob = require('glob')

const CUSTOM = ['']
const BOOLEAN = false

const options = {
  start: {
    '--port': CUSTOM,
    '--auto-watch': BOOLEAN,
    '--no-auto-watch': BOOLEAN,
    '--log-level': ['disable', 'debug', 'info', 'warn', 'error'],
    '--colors': BOOLEAN,
    '--no-colors': BOOLEAN,
    '--reporters': ['dots', 'progress'],
    '--no-reporters': BOOLEAN,
    '--browsers': ['Chrome', 'ChromeHeadless', 'ChromeCanary', 'Firefox', 'PhantomJS', 'Safari', 'Opera'],
    '--no-browsers': BOOLEAN,
    '--single-run': BOOLEAN,
    '--no-single-run': BOOLEAN,
    '--help': BOOLEAN
  },
  init: {
    '--log-level': ['disable', 'debug', 'info', 'warn', 'error'],
    '--colors': BOOLEAN,
    '--no-colors': BOOLEAN,
    '--help': BOOLEAN
  },
  run: {
    '--no-refresh': BOOLEAN,
    '--port': CUSTOM,
    '--help': BOOLEAN
  }
}

function opositeWord (word) {
  if (word.startsWith('-')) {
    return word.startsWith('--no-') ? `--${word.substr(5)}` : `--no-${word.substr(2)}`
  } else {
    return null
  }
}

function sendCompletion (possibleWords, env) {
  const regexp = new RegExp('^' + env.last)
  possibleWords
    .filter((word) => regexp.test(word) && !env.words.includes(word) && !env.words.includes(opositeWord(word)))
    .forEach((word) => {
      console.log(word)
    })
}

function sendCompletionFiles (env) {
  glob(env.last + '*', { mark: true, nocase: true }, (err, files) => {
    if (err) return console.error(err)

    if (files.length === 1 && files[0].endsWith('/')) {
      sendCompletionFiles({ last: files[0] })
    } else {
      console.log(files.join('\n'))
    }
  })
}

function complete (env) {
  if (env.count === 1) {
    return sendCompletion(env.words[0].startsWith('-') ? ['--help', '--version'] : Object.keys(options), env)
  } else if (env.count === 2 && !env.words[1].startsWith('-')) {
    return sendCompletionFiles(env)
  }

  const cmdOptions = options[env.words[0]]

  if (cmdOptions) {
    if (cmdOptions[env.prev] === CUSTOM && env.last) {
      console.log(env.last)
    } else {
      return sendCompletion(cmdOptions[env.prev] || Object.keys(cmdOptions), env)
    }
  }
}

function completion () {
  if (process.argv[3] === '--') {
    return complete({
      words: process.argv.slice(5),
      count: parseInt(process.env.COMP_CWORD, 10),
      last: process.argv[process.argv.length - 1],
      prev: process.argv[process.argv.length - 2]
    })
  }

  // just print out the karma-completion.sh
  const fs = require('graceful-fs')
  const path = require('path')

  fs.readFile(path.resolve(__dirname, '../scripts/karma-completion.sh'), 'utf8', function (err, data) {
    if (err) return console.error(err)

    process.stdout.write(data)
    process.stdout.on('error', function (error) {
      // Darwin is a real dick sometimes.
      //
      // This is necessary because the "source" or "." program in
      // bash on OS X closes its file argument before reading
      // from it, meaning that you get exactly 1 write, which will
      // work most of the time, and will always raise an EPIPE.
      //
      // Really, one should not be tossing away EPIPE errors, or any
      // errors, so casually.  But, without this, `. <(karma completion)`
      // can never ever work on OS X.
      if (error.errno === 'EPIPE') {
        error = null
      }
    })
  })
}

// PUBLIC API
exports.completion = completion

// for testing
exports.opositeWord = opositeWord
exports.sendCompletion = sendCompletion
exports.complete = complete
