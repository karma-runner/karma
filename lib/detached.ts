import fs = require('fs')

import {Server} from './server'
var configurationFile = process.argv[2]
var fileContents = fs.readFileSync(configurationFile, 'utf-8')
fs.unlink(configurationFile, function () {})
var data = JSON.parse(fileContents)
var server = new Server(data)
server.start(data)
