var VERSION = require('./constants').VERSION

function StatusUpdater (socket, titleElement, bannerElement, browsersElement) {
  function updateBrowsersInfo (browsers) {
    if (!browsersElement) {
      return
    }
    var status

    // clear browsersElement
    while (browsersElement.firstChild) {
      browsersElement.removeChild(browsersElement.firstChild)
    }

    for (var i = 0; i < browsers.length; i++) {
      status = browsers[i].isConnected ? 'idle' : 'executing'
      var li = document.createElement('li')
      li.setAttribute('class', status)
      li.textContent = browsers[i].name + ' is ' + status
      browsersElement.appendChild(li)
    }
  }

  function updateBanner (status) {
    return function (param) {
      if (!titleElement || !bannerElement) {
        return
      }
      var paramStatus = param ? status.replace('$', param) : status
      titleElement.textContent = 'Karma v' + VERSION + ' - ' + paramStatus
      bannerElement.className = status === 'connected' ? 'online' : 'offline'
    }
  }

  socket.on('connect', updateBanner('connected'))
  socket.on('disconnect', updateBanner('disconnected'))
  socket.on('reconnecting', updateBanner('reconnecting in $ seconds...'))
  socket.on('reconnect', updateBanner('connected'))
  socket.on('reconnect_failed', updateBanner('failed to reconnect'))
  socket.on('info', updateBrowsersInfo)
  socket.on('disconnect', function () {
    updateBrowsersInfo([])
  })
}

module.exports = StatusUpdater
