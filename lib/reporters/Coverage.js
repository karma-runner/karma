var path = require('path');
var fs = require('fs');
var util = require('util');
var istanbul = require('istanbul');
var dateformat = require('dateformat');

var helper = require('../helper');
var log = require('../logger').create('coverage');

var Store = istanbul.Store;

var BasePathStore = function(opts) {
  Store.call(this, opts);
  opts = opts || {};
  this.basePath = opts.basePath;
  this.delegate = Store.create('fslookup');
};
BasePathStore.TYPE = 'basePathlookup';
util.inherits(BasePathStore, Store);

Store.mix(BasePathStore, {
  keys : function() {
    return this.delegate.keys();
  },
  toKey : function(key) {
    if (key.indexOf('./') === 0) { return path.join(this.basePath, key); }
    return key;
  },
  get : function(key) {
    return this.delegate.get(this.toKey(key));
  },
  hasKey : function(key) {
    return this.delegate.hasKey(this.toKey(key));
  },
  set : function(key, contents) {
    return this.delegate.set(this.toKey(key), contents);
  }
});

var CoverageReporter = function(rootConfig, emitter) {
  var config = rootConfig.coverageReporter;
  var basePath = rootConfig.basePath;
  var outDir = config.dir;
  var type = config.type;

  this.adapters = [];
  var collectors;
  var pendingFileWritings = 0;
  var fileWritingFinished = function() {};

  function writeEnd() {
    if (!--pendingFileWritings) {
      fileWritingFinished();
    }
  }

  this.onRunStart = function(browsers) {
    collectors = {};
    browsers.forEach(function(browser) {
      collectors[browser.id] = new istanbul.Collector();
    });
  };

  this.onBrowserComplete = function(browser, result) {
    var cov = result.coverage;
    var collector = collectors[browser.id];
    if (cov && collector) {
      collector.add(cov);
      pendingFileWritings++;
      helper.mkdirIfNotExists(path.resolve(outDir), function() {
        var now = dateformat(new Date(), 'yyyymmdd_HHMMss');
        var name = 'coverage-' + browser.name + '-' + now + '.json';
        fs.writeFile(path.join(outDir, name), JSON.stringify(cov), 'utf8', function(err) {
          if (err) {
            log.error(err);
          }
          writeEnd();
        });
      });
    }
  };

  this.onRunComplete = function(browsers, results) {
    browsers.forEach(function(browser) {
      var collector = collectors[browser.id];
      if (collector) {
        pendingFileWritings++;
        var out = path.resolve(outDir, browser.name);
        helper.mkdirIfNotExists(out, function() {
          var options = helper.merge({}, config, {
            dir : out,
            sourceStore : new BasePathStore({
              basePath : basePath
            })
          });
          var reporter = istanbul.Report.create(type, options);
          try {
            reporter.writeReport(collector, true);
          } catch (e) {
            log.error(e);
          }
          collector.dispose();
          writeEnd();
        });
      }
    });
  };

  emitter.on('exit', function(done) {
    if (pendingFileWritings) {
      fileWritingFinished = done;
    } else {
      done();
    }
  });
};

// PUBLISH
module.exports = CoverageReporter;
