'use strict'

const fs = require('fs')

const Server = require('./server')
const configurationFile = process.argv[2]
const fileContents = fs.readFileSync(configurationFile, 'utf-8')
fs.unlink(configurationFile, function () {})
const data = JSON.parse(fileContents)
const server = new Server(data)
server.start(data)
