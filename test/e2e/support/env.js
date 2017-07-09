var {defineSupportCode} = require('cucumber')

defineSupportCode(function ({setDefaultTimeout}) {
  setDefaultTimeout(60 * 1000)
})
