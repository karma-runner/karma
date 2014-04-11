**The `files` array determines which files are included in the browser and which files are watched and served by Karma.**


## Pattern matching and `basePath`
- All of the relative patterns will get resolved to `basePath` first.
- If the `basePath` is a relative path, it gets resolved to the
  directory where the configuration file is.
- Eventually, all the patterns will get resolved into files using
  [glob], so you can use [minimatch] expressions like `test/unit/**/*.spec.js`.

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
    `<script>` tag? Use `false` if you want to load them manually, eg.
    using [Require.js](../plus/requirejs.html).

### `served`
* **Type.** Boolean
* **Default.** `true`
* **Description.** Should the files be served by Karma's webserver?

## Preprocessor transformations
Depending on preprocessor configuration, be aware that files loaded may be transformed and no longer available in
their native format. For instance, if html2js preprocessor is enabled, the actual .html files are no longer
served - but rather available as `window.__html__['my.html']`. Read more about [preprocessors].

## Complete example
Here is a complete example showing the different options possible:
```javascript
files: [

  // simple pattern to load the needed testfiles
  // equal to {pattern: 'test/unit/*.spec.js', watched: true, served: true, included: true}
  'test/unit/*.spec.js',

  // this file gets served but will be ignored by the watcher
  // note if html2js preprocessor is active, reference as `window.__html__['compiled/index.html']`
  {pattern: 'compiled/index.html', watched: false},

  // this file only gets watched and is otherwise ignored
  {pattern: 'app/index.html', included: false, served: false}
],
```

## Loading Assets
By default all assets are served at `http://localhost:[PORT]/base/`, Example for loading images

```javascript
files: [
  {pattern: 'test/images/*.jpg', watched: false, included: false, served: true}
],
```

in this case the image is accessed at `http://localhost:[PORT]/base/test/images/[MY IMAGE].jpg`

notice the **base** in the URL


or in addition you can use a proxy

```javascript
proxies: {
  '/img/': 'http://localhost:8080/base/test/images/'
},
```
now you can fetch images in 'test/images' at `http://localhost:8080/img/[MY IMAGE].jpg`

just change **8080** to the port you use



[glob]: https://github.com/isaacs/node-glob
[preprocessors]: preprocessors.html
[minimatch]: https://github.com/isaacs/minimatch
