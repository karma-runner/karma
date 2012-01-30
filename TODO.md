http://en.wikipedia.org/wiki/Test_Anything_Protocol

adapter for http://visionmedia.github.com/mocha/ + check out reporters

growl notifications ?

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


check for global state polution ?

allow/ not allow page reload (navigation)

control the configuration from dashboard (change log level for example)

reload config when change

nice error if port in use

debugging - allow break points from IDE ?

design extensible - allow server/client plugins, passing configuration to plugins (like jasmine - test only last failed)

auto start browser ?
dynamic port assign ?

DECISIONS

always reload iframe
- tested only some files loading
- decided to go with full iframe loading and heavy http caching
- this partial reloading is source of many problems in jstd
- benchmarks show it's still not slower than jstd (with multiple modern browsers it's much faster, because of socket.io)

- merging all source files into one, served from memory, not that good as well (need to reload all the files on server anyway)
+ losing line numbers, when error occurs

- loading all files by ajax and then eval -> again, losing line numbers, otherwise, this would perform well, and should be context safe

using iframe / tab
- we need to be able to clean the context easily, for stability
- using tabs would require solving problem, that the tab needs to have focus to execute, otherwise it gets iddle

server is configuration specific
- allow running different configuration, basically runner can ask for execution of any files...
- so you keep running only one server, probably as a daemon
- it would mean lot of complications, especially caching would be much more difficult
- watching files as well
- so I decided for scenario, when you have one server per configuration and you can start multiple instances (on different ports)
- we might solve dynamic port assigning... (needs to be shared with runner?)

