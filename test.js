function browser() {
  return window.navigator.userAgent.match(/Chrome\S*|Firefox\S*|Safari\S*/)[0];
}

console.log('testing...');
socket.emit('result', browser() + ': 1');