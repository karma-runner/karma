const { promisify } = require('util')

const sleep = promisify(setTimeout)

module.exports.waitForCondition = async (evaluateCondition, timeout = 1000) => {
  let remainingTime = timeout
  while (!evaluateCondition()) {
    if (remainingTime > 0) {
      await sleep(50)
      remainingTime -= 50
    } else {
      throw new Error(`Condition not fulfilled, waited ${timeout}ms`)
    }
  }
}
