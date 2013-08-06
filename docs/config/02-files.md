**The `files` array determines which files are included in the browser and which files are watched and served by Karma.**


## Pattern matching and `basePath`
- All of the relative patterns will get resolved to `basePath` first.
- If the `basePath` is a relative path, it gets resolved to the
  directory where the configuration file is.
- Eventually, all the patterns will get resolved into files using
  [glob], so you can use expressions like `test/unit/**/*.spec.js`.

## Ordering
- The order of patterns determines the order of files in which they
  are included in the browser.
- Multiple files matching a single pattern are sorted alphabetically.
- Each file is included exactly once. If multiple patterns match the
  same file, it's included as if it only matched the first pattern.

## Included, served, watched
Each pattern is either a simple string or an object with four properties:

### `pattern`
* **Description.** The pattern to use for matching. This property is mandatory.

### `watched`
* **Type.** Boolean
* **Default.** `true`
* **Description.**  If `autoWatch` is `true` all files that have set `watched` to true will be
  watched for changes.

### `included`
* **Type.** Boolean
* **Default.** `true`
* **Description.** Should the files be included in the browser using
    `<script>` tag? Use `false` if you wanna load them manually, eg.
    using [Require.js](../plus/RequireJS.html).

### `served`
* **Type.** Boolean
* **Default.** `true`
* **Description.** Should the files be served by Karma's webserver?


## Complete example
Here is a complete example showing the different options that are possible.
```javascript
files: [

  // simple patterns to load the needed testfiles
  // equals to {pattern: 'test/unit/*.spec.js', watched: true, served: true, included: true}
  'test/unit/*.spec.js',

  // this file gets served but will be ignored by the watcher
  {pattern: 'compiled/index.html', watched: false},

  // this file only gets watched but otherwise ignored
  {pattern: 'app/index.html', included: false, served: false}
],
```

[glob]: https://github.com/isaacs/node-glob
