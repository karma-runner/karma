var nextTickQueue = [];
var nextTickRegistered = false;

var nextTickHandler = function() {
  var pattern = exports.predictableNextTickPattern;
  var queue = nextTickQueue;

  nextTickRegistered = false;
  nextTickQueue = [];

  var base = 0;
  while (base < queue.length) {
    pattern.forEach(function(i) {
      var index = base + i;
      if (queue[index]) {
        try {
          queue[index]();
          queue[index] = null;
        } catch(e) {
          // filter only fns that still needs to be executed
          // just in the case someone will handle the exception
          queue[index] = null;
          var stillNeedToBeExec = queue.filter(function(fn) {
            return fn;
          });

          // re-register handler if there are more fns to execute
          if (stillNeedToBeExec.length) {
            nextTickQueue = stillNeedToBeExec.concat(nextTickQueue);

            if (!nextTickRegistered) {
              process.nextTick(nextTickHandler);
              nextTickHandlerRegistered = true;
            }
          }

          throw e;
        }
      }
    });
    base += pattern.length;
  }
};

exports.predictableNextTick = function(callback) {
  nextTickQueue.push(callback);

  if (!nextTickRegistered) {
    process.nextTick(nextTickHandler);
    nextTickRegistered = true;
  }
};

exports.predictableNextTickPattern = [0];
