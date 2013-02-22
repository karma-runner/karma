**The files array determines which files are loaded, watched and served by Testacular.**

## Adapters
The first thing you usually need is an adapter. The following adapters
are bundled with Testacular:

* Jasmine (`JASMINE`, `JASMINE_ADAPTER`)
* Mocha (`MOCHA`, `MOCHA_ADAPTER`)
* QUnit (`QUNIT`, `QUNIT_ADAPTER`)
* RequireJS (`REQUIRE`, `REQUIRE_ADAPTER`)
* Angular Scenario Runner (`ANGULAR_SCENARIO`, `ANGULAR_SCENARIO_ADAPTER`)

If you want to use any of these, add `<FRAMEWORK>` and
`<FRAMEWORK>_ADAPTER` to your `files` list. So for example if you want
to use Mocha you have the following in your config file:
```javascript
files = [
  MOCHA,
  MOCHA_ADAPTER
];
```

## Pattern matching and `basePath`
- All the relative patterns will get resolved to `basePath` first.
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
Since version 0.5.2 there is the ability to configure the patterns
more closely.

If you define them like before a simple pattern like
`'test/unit/*.js'` this gets expanded internally to the following:
```javascript
  {pattern: 'test/unit/*.js', watched: true, included: true, served: true}
```
### `pattern`
* **Description.** The pattern to use for matching.

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
* **Description.** Should the files be served by Testacular's webserver?

## Complete example
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

[glob]: https://github.com/isaacs/node-glob
