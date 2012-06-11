# Events

## browser_register(browser)
Browser sent name and id.


## browser_complete(browser)
Browser completed an execution run. (All tests were executed/skipped or browser disconnected).


## browser_error(browser, error)
Browser sent error (probably syntax error during loading).


## browser_dump(browser, dump)
Browser sent dump.

## browsers_change(collection)
Collection of captured browsers changed:

- new browser
- browser disconected
- browser changed status


## spec_complete(browser, result)
Single spec completed.


## run_start(collection)
Starting new execution run.


## run_complete(collection)
Whole execution run finished (all browsers finished).
