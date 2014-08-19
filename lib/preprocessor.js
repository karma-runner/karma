var path = require('path');
var fs = require('graceful-fs');
var crypto = require('crypto');
var mm = require('minimatch');

var log = require('./logger').create('preprocess');

var sha1 = function(data) {
  var hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
};

var isBinary = Object.create(null);
// TODO(aymeric): keep this list alphabetically sorted and wrapped to 80
// characters
[
  '3ds', '3g2', '3gp', 'aac', 'adp', 'aif', 'asf', 'au', 'bmp', 'btif', 'bz2',
  'caf', 'cgm', 'cmx', 'dat', 'djvu', 'dra', 'dts', 'dtshd', 'dvb', 'dwg',
  'dxf', 'ecelp4800', 'ecelp7470', 'ecelp9600', 'eol', 'eot', 'epub', 'f4v',
  'fbs', 'fh', 'flac', 'flac', 'fli', 'flv', 'fpx', 'fst', 'fvt', 'g3', 'gif',
  'gz', 'h261', 'h263', 'h264', 'ico', 'ief', 'jpeg', 'jpg', 'jpgv', 'jpm',
  'ktx', 'lvp', 'm3u', 'm4v', 'mdi', 'mid', 'mj2', 'mka', 'mkv', 'mmr', 'mng',
  'movie', 'mp3', 'mp4', 'mp4a', 'mpeg', 'mpga', 'mxu', 'nexe', 'npx', 'oga',
  'ogg', 'ogv', 'pbm', 'pcx', 'pexe', 'pgm', 'pic', 'png', 'pnm', 'ppm', 'psd',
  'pya', 'pyv', 'qt', 'rar', 'ras', 'rgb', 'rip', 'rlc', 's3m', 'sgi', 'sil',
  'smv', 'sub', 'swf', 'tar', 'tga', 'tiff', 'ttf', 'uvh', 'uvi', 'uvm', 'uvp',
  'uvs', 'uvu', 'viv', 'vob', 'wav', 'wax', 'wbmp', 'wdp', 'weba', 'webm',
  'webp', 'wm', 'wma', 'wmv', 'wmx', 'woff', 'wvx', 'xbm', 'xif', 'xm', 'xpm',
  'xwd', 'zip'
].forEach(function(extension) {
  isBinary['.' + extension] = true;
});

// TODO(vojta): instantiate preprocessors at the start to show warnings immediately
var createPreprocessor = function(config, basePath, injector) {
  var patterns = Object.keys(config);
  var alreadyDisplayedWarnings = Object.create(null);

  return function(file, done) {
    var thisFileIsBinary = isBinary[path.extname(file.originalPath)];
    var preprocessors = [];
    var nextPreprocessor = function(error, content) {
      // normalize B-C
      if (arguments.length === 1 && typeof error === 'string') {
        content = error;
        error = null;
      }

      if (error) {
        file.content = null;
        file.contentPath = null;
        return done(error);
      }

      if (!preprocessors.length) {
        file.contentPath = null;
        file.content = content;
        return done();
      }

      preprocessors.shift()(content, file, nextPreprocessor);
    };
    var instantiatePreprocessor = function(name) {
      if (alreadyDisplayedWarnings[name]) {
        return;
      }

      try {
        preprocessors.push(injector.get('preprocessor:' + name));
      } catch (e) {
        if (e.message.indexOf('No provider for "preprocessor:' + name + '"') !== -1) {
          log.warn('Can not load "%s", it is not registered!\n  ' +
                   'Perhaps you are missing some plugin?', name);
        } else {
          log.warn('Can not load "%s"!\n  ' + e.stack, name);
        }

        alreadyDisplayedWarnings[name] = true;
      }
    };

    // collects matching preprocessors
    // TODO(vojta): should we cache this ?
    for (var i = 0; i < patterns.length; i++) {
      if (mm(file.originalPath, patterns[i])) {
        if (thisFileIsBinary) {
          log.warn('Ignoring preprocessing (%s) %s because it is a binary file.',
              config[patterns[i]].join(', '), file.originalPath);
        } else {
          config[patterns[i]].forEach(instantiatePreprocessor);
        }
      }
    }

    return fs.readFile(file.originalPath, function(err, buffer) {
      file.sha = sha1(buffer);
      nextPreprocessor(null, thisFileIsBinary ? buffer : buffer.toString());
    });
  };
};
createPreprocessor.$inject = ['config.preprocessors', 'config.basePath', 'injector'];

exports.createPreprocessor = createPreprocessor;
