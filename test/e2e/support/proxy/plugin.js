function framework (config) {
  config.proxies = {
    '/foo.js': '/base/proxy/foo.js'
  }
}

framework.$inject = ['config']

module.exports = {
  'framework:foo': ['factory', framework]
}
