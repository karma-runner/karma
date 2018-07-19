var cucumber = require('cucumber')

cucumber.defineSupportCode((a) => {
  a.setDefaultTimeout(60 * 1000)
})
