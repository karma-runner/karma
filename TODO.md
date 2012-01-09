warning if no browser + execution

autowatch new files

jsdom execution

dashboard ? captured client status

static deps analyze (use require, goog.require, ...)

file preprocessing

proxy

if syntax error, throw syntax error, but stable - next run fine

if browser exit, stable

stats - which browsers are captured (expose as html, served by server)
dashboard (captured browsers, etc...)

batching all js into single file (served from memory)

if iframe - in-lining ?

prefetching files (when browser capture)

execution on server as well

watching for new files ?

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

rerun only some tests (i.e. last failed) - plugin
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

build?
 - jake, ...

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

