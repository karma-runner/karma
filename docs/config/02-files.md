**The `files` array determines which files are included in the browser and which files are watched and served by Karma.**


## Pattern matching and `basePath`
- All of the relative patterns will get resolved using the `basePath` first.
- If the `basePath` is a relative path, it gets resolved to the
  directory where the configuration file is located.
- Eventually, all the patterns will get resolved into files using
  [glob], so you can use [minimatch] expressions like `test/unit/**/*.spec.js`.


## Ordering
- The order of patterns determines the order in which files are included in the browser.
- Multiple files matching a single pattern are sorted alphabetically.
- Each file is included exactly once. If multiple patterns match the
  same file, it's included as if it only matched the first pattern.


## Included, served, watched
Each pattern is either a simple string or an object with four properties:

### `pattern`
* **Type.** String
* **No Default.**
* **Description.** The pattern to use for matching. This property is mandatory.

### `type`
* **Type.** String
* **Default.** Will attempt to determine type based on file extension. If that fails, defaults to `js`.
* **Description.** Choose the type to use when including a file.
* **Possible Values:**
  * `css`
  * `html`
  * `js`
  * `dart`
  * `module`

### `watched`
* **Type.** Boolean
* **Default.** `true`
* **Description.**  If `autoWatch` is `true` all files that have set `watched` to true will be watched for changes.

### `included`
* **Type.** Boolean
* **Default.** `true`
* **Description.** Should the files be included in the browser using
    `<script>` tag? Use `false` if you want to load them manually, eg.
    using [Require.js](../plus/requirejs.html).
    
    If a file is covered by multiple patterns with different `include` properties, the most specific pattern takes
    precedence over the other.
    
    The specificity of the pattern is defined as a six-tuple, where larger tuple implies lesser specificity: 
    *(n<sub>glob parts</sub>, n<sub>glob star</sub>, n<sub>star</sub>, n<sub>ext glob</sub>, n<sub>range</sub>, n<sub>optional</sub>)*.
    Tuples are compared lexicographically. 
    
    The *n<sub>glob parts</sub>* is the number of patterns after the bracket sections are expanded. E.g. the 
    the pattern *{0...9}* will yield *n<sub>glob parts</sub>=10*. The rest of the tuple is decided as the least
    specific of each expanded pattern. 

### `served`
* **Type.** Boolean
* **Default.** `true`
* **Description.** Should the files be served by Karma's webserver?

### `nocache`
* **Type.** Boolean
* **Default.** `false`
* **Description.** Should the files be served from disk on each request by Karma's webserver?


## Preprocessor transformations
Depending on preprocessor configuration, be aware that files loaded may be transformed and no longer available in
their native format. For instance, if html2js preprocessor is enabled, the actual .html files are no longer
served - but rather available as `window.__html__['my.html']`. Read more about [preprocessors].


## Complete example
Here is a complete example showing the different options possible:
```javascript
files: [

  // Detailed pattern to include a file. Similarly other options can be used
  { pattern: 'lib/angular.js', watched: false },
  // Prefer to have watched false for library files. No need to watch them for changes

  // simple pattern to load the needed testfiles
  // equal to {pattern: 'test/unit/*.spec.js', watched: true, served: true, included: true}
  'test/unit/*.spec.js',

  // this file gets served but will be ignored by the watcher
  // note if html2js preprocessor is active, reference as `window.__html__['compiled/index.html']`
  {pattern: 'compiled/index.html', watched: false},

  // this file only gets watched and is otherwise ignored
  {pattern: 'app/index.html', included: false, served: false},

  // this file will be served on demand from disk and will be ignored by the watcher
  {pattern: 'compiled/app.js.map', included: false, served: true, watched: false, nocache: true}
],
```

## Loading Assets
By default all assets are served at `http://localhost:[PORT]/base/`

Example for loading images

```javascript
files: [
  {pattern: 'test/images/*.jpg', watched: false, included: false, served: true, nocache: false}
],
```

The pattern is a glob which matches the specified image assets. Watched and included are not necessary as images are not tests. However, they will need to be served to the browser.

In this case an image would be accessed at `http://localhost:[PORT]/base/test/images/[MY IMAGE].jpg`

Notice the **base** in the URL, it is a reference to your **basePath**. You do not need to replace or provide your own **base**.

In addition, you can use a proxy

```javascript
proxies: {
  "/img/": "http://localhost:8080/base/test/images/"
},
```

Now you can fetch images in `test/images` at `http://localhost:8080/img/[MY IMAGE].jpg`

Change **8080** to the port you use

You can also use proxies without specifying the protocol, hostname, and port

```javascript
proxies: {
  "/img/": "/base/test/images/"
},
```

## Webserver features

* [Range requests][].
* In-memory caching of files.
* Watching for updates in the files.
* Proxies to alter file paths.


[glob]: https://github.com/isaacs/node-glob
[preprocessors]: preprocessors.html
[minimatch]: https://github.com/isaacs/minimatch
[Range requests]: https://en.wikipedia.org/wiki/Byte_serving
