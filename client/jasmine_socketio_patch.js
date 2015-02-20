// TODO(vojta): remove once we don't care about karma-jasmine 0.1.x
//
// karma-jasmine@0.1.x relies on socket.io@0.9.x internals to figure out which transport is used.
// See https://github.com/karma-runner/karma-jasmine/blob/57dddeed2771d65457418f0357f740e3d64d6862/src/adapter.js#L50
//
// This should be ultimately solved on socket.io level (split or truncate too big messages).

var hostname = 'http://' + location.host;

if (!location.port) {
  hostname += ':80';
}

if (!io.sockets) {
  io.sockets = {};
  // Patch, so that karma-jasmine does not throw "undefined has no transport property".
  io.sockets[hostname] = {transport: {name: '<unknown transport>'}};
}
