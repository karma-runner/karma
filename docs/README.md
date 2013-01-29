# Testacular Docs


## Installation & Building

Install modules

```bash
$ npm install
```
Install [grunt-cli]
```bash
$ npm install -g grunt-cli
```
Run build
```bash
$ grunt
```

## Grunt Tasks

### docs
This task is the heart of all the operations. The source is under
`tasks/docs.js` and it generates all the docs using [panda-docs].

#### `files`
This option defines where the source documents are and where the
output folder is.

Example:
```javascript
files = {
  'public': 'src'
}
```
#### Options 
##### `copy`
This is a list of markdown files that gets copied into the source directory
before generating the documentation

Example:
```javascript
copy = {
  'CONTRIBUTING': 'dev/01_contributing'
}
```

##### Panda-Docs Options
All the panda-docs options can be set to override the defaults.

### server
Start a development server under `localhost:9000` using [grunt-contrib-connect].

### build
Builds the templates using the following tasks

* `less`: Compile all less files from `template/src/less` to css
  files in `templates/build/assets/css/app.css`.
* `mincss`: Minify the just compiled `app.css` file.
* `uglify`: Minify all needed js files from `template/src/js/` into
  `template/build/assets/js/app.js`.


## Templates

The templates are run through [panda-docs] and provide the following 
variables:

### provided by panda-docs

* `content` is the transformed HTML content of your Markdown file
* `metadata` is an object containing your document-based metadata values
* `manifest` is an object containing the Manifest.json properties
* `toh` is an object containing the headings for each file (`h1`, `h2`, _e.t.c._). See below for more information on this object.
* `headingTable` is a function you can use to generate a list of your page's table of contents. See below for more information on using this
* `fileName` is the name of the resulting file (without the extension)
* `title` is the title of the documentation
* `pageTitle` is the title of the current page
* `mtime` indicates the last modified time of your source file
* `markdown` references the Markdown converter; since this is based on namp, you'll want to add `.html` at the end to get the actual HTML

### provided buy `taks/docs.js`

* `versions` is a list of all available versions as found in `src`.
* `currentVersion` is the current version that is being built.
* `fileList` is an object containing the necessary information about
  the available documents for the current build.

[grunt-cli]: https://github.com/gruntjs/grunt-cli
[panda-docs]: https://github.com/gjtorikian/panda-docs
[grunt-contrib-connect]: https://github.com/gruntjs/grunt-contrib-connect
