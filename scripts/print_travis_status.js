#!/usr/bin/env node
'use strict'

var http = require('https')

var COLORS = {
  green: ['\x1B[32m', '\x1B[39m'],
  red: ['\x1B[31m', '\x1B[39m']
}

var repo = process.argv[2]
var branches = process.argv[3]

if (!branches) {
  console.log('No pending branches.')
  process.exit(0)
}

branches = branches.split('\n')

var options = {
  hostname: 'api.travis-ci.org',
  headers: {
    'User-Agent': 'Vojta/0.0.1',
    'Accept': 'application/vnd.travis-ci.2+json'
  }
}

function red (str) {
  return COLORS.red[0] + str + COLORS.red[1]
}

function green (str) {
  return COLORS.green[0] + str + COLORS.green[1]
}

function bufferJsonStream (stream, done) {
  var buffer = ''

  stream.on('data', function (data) {
    buffer += data.toString()
  })

  stream.on('end', function () {
    done(JSON.parse(buffer))
  })
}

branches.forEach(function (branch) {
  options.path = '/repos/' + repo + '/branches/' + branch

  http.get(options, function (response) {
    bufferJsonStream(response, function (resp) {
      console.log('Branch: ' + branch)
      console.log('  https://github.com/' + repo + '/tree/' + branch)

      if (response.headers.status === '404 Not Found') {
        console.log(red('Travis: NOT FOUND'))
      } else {
        switch (resp.branch.state) {
          case 'passed':
            console.log(green('Travis: ' + resp.branch.state + ' (' + resp.branch.finished_at + ')'))
            break
          case 'failed':
            console.log(red('Travis: ' + resp.branch.state + ' (' + resp.branch.finished_at + ')'))
            break
          case 'started':
            console.log('Travis: ' + resp.branch.state + ' (' + resp.branch.started_at + ')')
            break
          default:
            console.log('Travis: ' + resp.branch.state)
        }
        console.log('  https://travis-ci.org/' + repo + '/builds/' + resp.branch.id)
      }

      console.log('')
    })
  })
})
