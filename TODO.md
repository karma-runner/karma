opera - angular

reporter writing (pipelining) already closed socket (disconnected browser)

cancel run - if server disconnects (at least do not send report afterwards)

if browser disconnects during run, complete without waiting for complete

readme - add development section
readme - add example (configuration)

make global event emitter

server -> runner general format, so that it can use different reporter ?)

util.js:24 replace of null

format error stack so that webstorm can parse it

http://en.wikipedia.org/wiki/Test_Anything_Protocol

adapter for http://visionmedia.github.com/mocha/ + check out reporters

growl notifications ?

make a screencast how to test it (during development), how to debug with webstorm, etc...

integration with cloud9 http://c9.io/

autowatch new files

jsdom execution

dashboard ? captured client status

static deps analyze (use require, goog.require, ...)

file preprocessing

proxy

if browser exit, stable

stats - which browsers are captured (expose as html, served by server)
dashboard (captured browsers, etc...)

batching all js into single file (served from memory)

if iframe - in-lining ?

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

using tab instead of iframe

analyse deps (goog.provide, require) and execute only related tests

more granularity during execution (continuous info about tests)

allow passing configuration into client (both config, test run params)

interesting modules:
https://github.com/joyent/node/wiki/modules

testing framework
- jasmine
- vows
- cucumber ?
mocha

static web server ?

proxy


CLI options parser ?

async lib
- q ?


underscore
!!! jsdom

graphic:
Manuel wesen@ruinwesen.com

jellyfish - starting + config browsers
zombie (jsdom implementation of headless browser)

allow execution - with different files (e.g. different test loads different files)

buster.js - copy of JSTD in Node.js
- using ws, but custom
- can't handle browser termination and other jstd problems


check for global state polution ?

allow/ not allow page reload (navigation)

control the configuration from dashboard (change log level for example)

reload config when change

nice error if port in use

debugging - allow break points from IDE ?

design extensible - allow server/client plugins, passing configuration to plugins (like jasmine - test only last failed)

auto start browser ?
dynamic port assign ?



