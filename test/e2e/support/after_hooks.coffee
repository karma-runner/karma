
afterHooks = ->

  @After (callback) ->

    if @child? and @child?kill?
      @child.kill()
      @child = null
      callback()

    else
      callback()

module.exports = afterHooks
