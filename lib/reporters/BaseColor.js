var BaseColorReporter = function() {
  this.SPEC_FAILURE = '\x1B[31m%s %s FAILED\x1B[39m' + '\n';
  this.SPEC_SLOW = '\x1B[33m%s SLOW %s:\x1B[39m %s\n';
  this.ERROR = '\x1B[31m%s ERROR\x1B[39m\n';

  this.FINISHED_ERROR = ' \x1B[31mERROR\x1B[39m';
  this.FINISHED_SUCCESS = ' \x1B[32mSUCCESS\x1B[39m';
  this.FINISHED_DISCONNECTED = ' \x1B[31mDISCONNECTED\x1B[39m';

  this.X_FAILED = ' \x1B[31m(%d FAILED)\x1B[39m';

  this.TOTAL_SUCCESS = '\x1B[32mTOTAL: %d SUCCESS\x1B[39m\n';
  this.TOTAL_FAILED = '\x1B[31mTOTAL: %d FAILED, %d SUCCESS\x1B[39m\n';
};


// PUBLISH
module.exports = BaseColorReporter;
