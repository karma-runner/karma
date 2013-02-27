#!/usr/bin/env node

// TODO(vojta): report errors, currently Q silence everything which really sucks
// TODO(vojta): use grunt logger

var child = require('child_process');
var fs = require('fs');
var util = require('util');
var q = require('qq');

var GIT_LOG_CMD = 'git log --grep="%s" -E --format=%s %s..HEAD';
var GIT_TAG_CMD = 'git describe --tags --abbrev=0';

var PATCH_HEADER_TPL = '<a name="%s"></a>\n### %s (%s)\n\n';
var MINOR_HEADER_TPL = '<a name="%s"></a>\n## %s (%s)\n\n';
var LINK_ISSUE = '[#%s](https://github.com/testacular/testacular/issues/%s)';
var LINK_COMMIT = '[%s](https://github.com/testacular/testacular/commit/%s)';

var EMPTY_COMPONENT = '$$';
var MAX_SUBJECT_LENGTH = 80;

var PATTERN = /^(\w*)(\(([\w\$\.\-\*]*)\))?\: (.*)$/;

var warn = function() {
  console.log('WARNING:', util.format.apply(null, arguments));
};


var parseRawCommit = function(raw) {
  if (!raw) {
    return null;
  }

  var lines = raw.split('\n');
  var msg = {}, match;

  msg.hash = lines.shift();
  msg.subject = lines.shift();
  msg.closes = [];
  msg.breaks = [];

  lines.forEach(function(line) {
    match = line.match(/Closes\s#(\d+)/);
    if (match) {
      msg.closes.push(parseInt(match[1], 10));
    }
  });

  match = raw.match(/BREAKING CHANGE:\s([\s\S]*)/);
  if (match) {
    msg.breaks.push(match[1]);
  }


  msg.body = lines.join('\n');
  match = msg.subject.match(PATTERN);

  if (!match || !match[1] || !match[4]) {
    warn('Incorrect message: %s %s', msg.hash, msg.subject);
    return null;
  }

  if (match[4].length > MAX_SUBJECT_LENGTH) {
    warn('Too long subject: %s %s', msg.hash, msg.subject);
    match[4] = match[4].substr(0, MAX_SUBJECT_LENGTH);
  }

  msg.type = match[1];
  msg.component = match[3];
  msg.subject = match[4];

  return msg;
};


var linkToIssue = function(issue) {
  return util.format(LINK_ISSUE, issue, issue);
};


var linkToCommit = function(hash) {
  return util.format(LINK_COMMIT, hash.substr(0, 8), hash);
};


var currentDate = function() {
  var now = new Date();
  var pad = function(i) {
    return ('0' + i).substr(-2);
  };

  return util.format('%d-%s-%s', now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()));
};

// Print ## 0.2.0 if it's a minor version bump
// and ### 0.2.1 if it's just a a patch bump
var printHeader = function(stream, version) {
  var header = version.split('.')[2] === '0' ? MINOR_HEADER_TPL : PATCH_HEADER_TPL;
  stream.write(util.format(header, version, version, currentDate()));
};

var printSection = function(stream, title, section) {
  var components = Object.getOwnPropertyNames(section).sort();

  if (!components.length) {
    return;
  }

  stream.write(util.format('\n#### %s\n\n', title));

  components.forEach(function(name) {
    var prefix = '*';
    var nested = section[name].length > 1;

    if (name !== EMPTY_COMPONENT) {
      if (nested) {
        stream.write(util.format('* **%s:**\n', name));
        prefix = '  *';
      } else {
        prefix = util.format('* **%s:**', name);
      }
    }

    section[name].forEach(function(commit) {
      stream.write(util.format('%s %s (%s', prefix, commit.subject, linkToCommit(commit.hash)));
      if (commit.closes.length) {
        stream.write(', closes ' + commit.closes.map(linkToIssue).join(', '));
      }
      stream.write(')\n');
    });
  });

  stream.write('\n');
};


var readGitLog = function(grep, from) {
  var deffered = q.defer();

  // TODO(vojta): if it's slow, use spawn and stream it instead
  child.exec(util.format(GIT_LOG_CMD, grep, '%H%n%s%n%b%n==END==', from), function(code, stdout, stderr) {
    var commits = [];

    stdout.split('\n==END==\n').forEach(function(rawCommit) {
      var commit = parseRawCommit(rawCommit);
      if (commit) {
        commits.push(commit);
      }
    });

    deffered.resolve(commits);
  });

  return deffered.promise;
};


var writeChangelog = function(stream, commits, version) {
  var sections = {
    fix: {},
    feat: {},
    breaks: {}
  };

  commits.forEach(function(commit) {
    var section = sections[commit.type];
    var component = commit.component || EMPTY_COMPONENT;

    if (section) {
      section[component] = section[component] || [];
      section[component].push(commit);
    }

    commit.breaks.forEach(function(breakMsg) {
      sections.breaks[EMPTY_COMPONENT] = sections.breaks[EMPTY_COMPONENT] || [];

      sections.breaks[EMPTY_COMPONENT].push({
        subject: breakMsg,
        hash: commit.hash,
        closes: []
      });
    });
  });

  printHeader(stream, version);
  printSection(stream, 'Bug Fixes', sections.fix);
  printSection(stream, 'Features', sections.feat);
  printSection(stream, 'Breaking Changes', sections.breaks);
};


var getPreviousTag = function() {
  var deffered = q.defer();
  child.exec(GIT_TAG_CMD, function(code, stdout, stderr) {
    if (code) {
      deffered.reject('Cannot get the previous tag.');
    }
    else {
      deffered.resolve(stdout.replace('\n', ''));
    }
  });
  return deffered.promise;
};


exports.generate = function(version) {
  return getPreviousTag().then(function(tag) {
    console.log('Reading git log since', tag);
    return readGitLog('^fix|^feat|BREAKING', tag).then(function(commits) {
      console.log('Parsed', commits.length, 'commits');

      var fakeStream = {
        data: '',
        write: function(str) {
          this.data += str;
        }
      };

      writeChangelog(fakeStream, commits, version);

      return fakeStream.data;
    });
  });
};

// publish for testing
exports.parseRawCommit = parseRawCommit;
