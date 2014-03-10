allTestFiles = []
TEST_REGEXP = /test\.coffee$/
pathToModule = (path) ->
  path.replace(/^\/base\//, "").replace /\.coffee$/, ""

Object.keys(window.__karma__.files).forEach (file) ->
  # Normalize paths to RequireJS module names.
  allTestFiles.push pathToModule(file)  if TEST_REGEXP.test(file)
  return

require.config
  # Karma serves files under /base, which is the basePath from your config file
  baseUrl: "/base"

  # dynamically load all test files
  deps: allTestFiles

  # we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start