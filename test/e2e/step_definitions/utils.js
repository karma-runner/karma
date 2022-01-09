const { promisify } = require('util')

const sleep = promisify(setTimeout)

module.exports.waitForCondition = async (evaluateCondition, timeout = 1000, customError = null) => {
  let remainingTime = timeout
  while (!evaluateCondition()) {
    if (remainingTime > 0) {
      await sleep(50)
      remainingTime -= 50
    } else {
      if (customError != null) {
        throw customError()
      } else {
        throw new Error(`Condition not fulfilled, waited ${timeout}ms`)
      }
    }
  }
}
