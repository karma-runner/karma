# Files

The files array determines wich files are loaded, watched and served by Testacular.

Warning: The order in which the files are defined, determines the load order!

## Adapters
The first thing you usually need is an adapter. The following adapters are bundled with Testacular
* Mocha
* Jasmine
* QUnit (0.5.5)
* RequireJS (0.5.1)

If you want to use any of these you add `LIBRARY` and `LIBRARY_ADAPTER` to your `files` list. So for
example if you want to use Mocha you have the following in your config file.
```javascript
files = [
  MOCHA,
  MOCHA_ADAPTER
];
```

## Pattern matching and `basePath`
All files that come from you and are not bundled with Testacular can get included via glob patterns. 
For example you can just write `myFile.js` or something more elaborate like `test/unit/**/*.spec.js`. 
These files get resolved to absolute paths using the `basePath` options, so if we set `basePath = '../'` and our configuration is in the folder `projectRoot/config`, our files get resolved to

* `myFile.js` --> `/projectRoot/myFile.js`
* `test/unit/**/*.spec.js` --> `/projectRoot/test/unit/**/*.spec.js`

and then they are matched using [minimatch](https://github.com/isaacs/minimatch) against the file system.

## Included, served, watched
Since version 0.5.2 there is the ability to configure the patterns more closely. If you define them like before a simple pattern like `'test/unit/*.js'` gets expanded internally to the following
```javascript
  {pattern: 'test/unit/*.js', watched: true, included: true, served: true}
```
### `pattern`
* **Description.** The pattern to use for matching.

### `watched`
* **Type.** Boolean
* **Default.** `true`
* **Description.** 
If `autoWatch` is `true` all files that have set `watched` to true will be 
  polled for changes.

### `included`
* **Type.** Boolean
* **Default.** `true`
* **Description.** Should the files be included into the loading process of the files into the browser.

### `served`
* **Type.** Boolean
* **Default.** `true`
* **Description.** Should the files be served by Testaculars webserver.

## Finished example
Here is a complete example showing the different options that are possible.
```javascript
files = [
  // Adapter
  MOCHA,
  MOCHA_ADAPTER,
  // simple patterns to load the needed testfiles
  'test/fixtures/**/*.html',
  'test/unit/*.spec.js',
  // this file gets served but will be ignored by the watcher
  {pattern: 'compiled/index.html', watched: false},
  // this file only gets watched but otherwise ignored
  {pattern: 'app/index.html', included: false, served: false}
  
];
```
