'use strict'

const logQueue = []
function printLogQueue () {
  logQueue.forEach((log) => log())
  logQueue.length = 0
}

function push (log) {
  logQueue.push(log)
}

module.exports = {
  printLogQueue, push
}
