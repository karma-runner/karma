make global event emitter (+ instantiate(Class) that would register listeners)


disable console - option to completely disable console (to disable leaking)

WebStorm issues:
- terminal escaping

opera, ff - angular

handle - Chrome's script causes too much memory message ?

server -> runner general format, so that it can use different reporter ?)

util.js:24 replace of null

http://en.wikipedia.org/wiki/Test_Anything_Protocol

growl notifications ?

jsdom execution

dashboard ? captured client status

file preprocessing

stats - which browsers are captured (expose as html, served by server)
dashboard (captured browsers, etc...)

prefetching files (when browser capture)

execution on server as well

pluginability (hookable system) - allow server side module to handle results
(allow hookable modules on both server, client sides)
hookable events, centralized for easy plugin registration

flexible file loader - which files should be run (wildchars, include/exclude, function ?)

refresh only some files ? (is it possible to be stable ?)
?should we care about dependencies - when reloading, reload all depended files

use framework (module) for static file serving ? https://github.com/joyent/node/wiki/modules#wiki-web-frameworks-static

debugging ? breakpoints (node, browser)

make server daemon ?

run on only available clients ? (if one is executing previous run)

using tab instead of iframe, using frames ?

more granularity during execution (continuous info about tests)

allow passing configuration into client (both config, test run params)

interesting modules:
https://github.com/joyent/node/wiki/modules

underscore
!!! jsdom

graphic:
Manuel wesen@ruinwesen.com

check for global state polution ?

allow/ not allow page reload (navigation)

control the configuration from dashboard (change log level for example)

debugging - allow break points from IDE ?

design extensible - allow server/client plugins, passing configuration to plugins (like jasmine - test only last failed)


E2E TESTS:
- disconnects browser during run
- reconnect browser
- disconnect server + reconnect
- all tests passed / failures
- syntax error
