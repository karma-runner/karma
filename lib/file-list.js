// File List
// =========
//
// The List is an object for tracking all files that karma knows about
// currently.

// Dependencies
// ------------

var Promise = require('bluebird')
var Immutable = require('immutable')

// Constructor
//
// patterns      - Array
// excludes      - Array
// emitter       - EventEmitter
// preprocess    - Function
// batchInterval - Number
var List = function (patterns, excludes, emitter, preprocess, batchInterval) {

  // Store options
  this._patterns = patterns
  this._excludes = excludes
  this._emitter = emitter
  this._preprocess = Promise.promisify(preprocess)
  this._batchInterval = batchInterval

  // The actual list of files
  this.buckets = Immutable.List()

  // Internal tracker if we are refreshing.
  // When a refresh is triggered this gets set
  // to the promise that `this._refresh` returns.
  // So we know we are refreshing when this promise
  // is still pending, and we are done when it's easier
  // resolved or rejected.
  this._refreshing = Promise.resolve()
}

// Private Interface
// -----------------

// Check if we are currently refreshing
List.prototype._isRefreshing = function () {
  return this._refreshing.isPending()
}

// Do the actual work of refreshing
List.prototype._refresh = function () {
  return Promise.delay(0)
}

// Public Interface
// ----------------

// Reglob all patterns to update the list.
//
// Returns a promise that is resolved when the refresh
// is completed.
List.prototype.refresh = function () {
  if (!this._isRefreshing()) {
    this._refreshing = this._refresh()
  }

  return this._refreshing
}

// Set new patterns and excludes and update
// the list accordingly
//
// patterns - Array, the new patterns.
// excludes - Array, the new exclude patterns.
//
// Returns a promise that is resolved when the refresh
// is completed.
List.prototype.reload = function (patterns, excludes) {
  this._patterns = patterns
  this._excludes = excludes

  // Wait until the current refresh is done and then do a
  // refresh to ensure a refresh actually happens
  return this._refreshing.then(this.refresh.bind(this))
}

// Add a new file from the list.
// This is called by the watcher
//
// path - String, the path of the file to update.
//
// Returns a promise that is resolved when the update
// is completed.
List.prototype.addFile = function (path) {

}

// Update the `mtime` of a file.
// This is called by the watcher
//
// path - String, the path of the file to update.
//
// Returns a promise that is resolved when the update
// is completed.
List.prototype.changeFile = function (path) {

}

// Remove a file from the list.
// This is called by the watcher
//
// path - String, the path of the file to update.
//
// Returns a promise that is resolved when the update
// is completed.
List.prototype.removeFile = function (path) {

}

// Inject dependencies
List.$inject = ['config.files', 'config.exclude', 'emitter', 'preprocess',
  'config.autoWatchBatchDelay']

// PUBLIC
module.exports = List
