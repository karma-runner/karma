var nextTickQueue = [];
var nextTickRegistered = false;
exports.randomNextTick = function(callback) {
  nextTickQueue.push(callback);

  if (!nextTickRegistered) {
    process.nextTick(function() {
      // random sort the callbacks
      nextTickQueue.sort(function() {
        return 0.5 - Math.random();
      });
      while (nextTickQueue.length) nextTickQueue.pop()();
    });
  }
};
