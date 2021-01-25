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

  var connectionText = 'never-connected'
  var testText = 'loading'
  var pingText = ''

  function updateBanner () {
    if (!titleElement || !bannerElement) {
      return
    }
    titleElement.textContent = 'Karma v ' + VERSION + ' -  ' + connectionText + ' test: ' + testText + '; ' + pingText
    bannerElement.className = connectionText === 'connected' ? 'online' : 'offline'
  }

  function updateConnectionStatus (connectionStatus) {
    connectionText = connectionStatus || connectionText
    updateBanner()
  }
  function updateTestStatus (testStatus) {
    testText = testStatus || testText
    updateBanner()
  }
  function updatePingStatus (pingStatus) {
    pingText = pingStatus || pingText
    updateBanner()
  }

  socket.on('connect', () => {
    updateConnectionStatus('connected')
  })
  socket.on('disconnect', () => {
    updateConnectionStatus('disconnected')
  })
  socket.on('reconnecting', (sec) => {
    updateConnectionStatus('reconnecting in ' + sec + ' seconds')
  })
  socket.on('reconnect', () => {
    updateConnectionStatus('reconnected')
  })
  socket.on('reconnect_failed', () => {
    updateConnectionStatus('reconnect_failed')
  })

  socket.on('info', updateBrowsersInfo)
  socket.on('disconnect', () => {
    updateBrowsersInfo([])
  })

  socket.on('ping', () => {
    updatePingStatus('ping...')
  })
  socket.on('pong', (latency) => {
    updatePingStatus('ping ' + latency + 'ms')
  })

  return { updateTestStatus: updateTestStatus }
}

module.exports = StatusUpdater
