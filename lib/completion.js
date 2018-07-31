'use strict'

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

function parseEnv (argv, env) {
  const words = argv.slice(5)

  return {
    words: words,
    count: parseInt(env.COMP_CWORD, 10),
    last: words[words.length - 1],
    prev: words[words.length - 2]
  }
}

function opositeWord (word) {
  if (word.charAt(0) !== '-') {
    return null
  }

  return word.substr(0, 5) === '--no-' ? '--' + word.substr(5) : '--no-' + word.substr(2)
}

function sendCompletionNoOptions () {}

function sendCompletion (possibleWords, env) {
  const regexp = new RegExp('^' + env.last)
  const filteredWords = possibleWords.filter(function (word) {
    return regexp.test(word) && env.words.indexOf(word) === -1 &&
      env.words.indexOf(opositeWord(word)) === -1
  })

  if (!filteredWords.length) {
    return sendCompletionNoOptions(env)
  }

  filteredWords.forEach(function (word) {
    console.log(word)
  })
}

const glob = require('glob')
const globOpts = {
  mark: true,
  nocase: true
}

function sendCompletionFiles (env) {
  glob(env.last + '*', globOpts, function (err, files) {
    if (err) return console.error(err)

    if (files.length === 1 && files[0].charAt(files[0].length - 1) === '/') {
      sendCompletionFiles({last: files[0]})
    } else {
      console.log(files.join('\n'))
    }
  })
}

function sendCompletionConfirmLast (env) {
  console.log(env.last)
}

function complete (env) {
  if (env.count === 1) {
    if (env.words[0].charAt(0) === '-') {
      return sendCompletion(['--help', '--version'], env)
    }

    return sendCompletion(Object.keys(options), env)
  }

  if (env.count === 2 && env.words[1].charAt(0) !== '-') {
    // complete files (probably karma.conf.js)
    return sendCompletionFiles(env)
  }

  const cmdOptions = options[env.words[0]]
  const previousOption = cmdOptions[env.prev]

  if (!cmdOptions) {
    // no completion, wrong command
    return sendCompletionNoOptions()
  }

  if (previousOption === CUSTOM && env.last) {
    // custom value with already filled something
    return sendCompletionConfirmLast(env)
  }

  if (previousOption) {
    // custom options
    return sendCompletion(previousOption, env)
  }

  return sendCompletion(Object.keys(cmdOptions), env)
}

function completion () {
  if (process.argv[3] === '--') {
    return complete(parseEnv(process.argv, process.env))
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
