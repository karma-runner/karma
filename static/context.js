// Define a placeholder for Karma to be defined via the parent window
// DEV: This is a placeholder change for upcoming edits in https://github.com/karma-runner/karma/pull/1984
window.__karma__ = {
  setupContext: function (contextWindow) {
    // sets window.__karma__ and overrides console and error handling
    // Use window.opener if this was opened by someone else - in a new window
    if (contextWindow.opener) {
      contextWindow.opener.karma.setupContext(contextWindow)
    } else {
      contextWindow.parent.karma.setupContext(contextWindow)
    }
  }
}
