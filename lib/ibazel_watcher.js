const {createInterface} = require('readline');

// ibazel will write this string after a successful build
// We don't want to re-trigger tests if the compilation fails, so
// we should only listen for this event.
const IBAZEL_NOTIFY_BUILD_SUCCESS = 'IBAZEL_BUILD_COMPLETED SUCCESS';

function watch(fileList) {
  // ibazel communicates with us via stdin
  const rl = createInterface({input: process.stdin, terminal: false});
  rl.on('line', chunk => {
    if (chunk === IBAZEL_NOTIFY_BUILD_SUCCESS) {
      fileList.refresh();
    }
  });
  rl.on('close', () => {
    // Give ibazel 5s to kill our process, otherwise do it ourselves
    setTimeout(() => {
      console.error('ibazel failed to stop karma after 5s; probably a bug');
      process.exit(1);
    }, 5000);
  });
}

watch.$inject = ['fileList'];

exports.watch = watch
