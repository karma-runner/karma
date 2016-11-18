import helper = require('../helper')

export class MultiReporter {
  constructor(private reporters) {
  }
  addAdapter(adapter) {
    this.reporters.forEach((reporter) => {
      reporter.adapters.push(adapter)
    })
  }

  removeAdapter(adapter) {
    this.reporters.forEach((reporter) => {
      helper.arrayRemove(reporter.adapters, adapter)
    })
  }
}
