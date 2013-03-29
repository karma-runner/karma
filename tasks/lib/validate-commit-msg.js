#!/usr/bin/env node

/**
 * Git COMMIT-MSG hook for validating commit message
 * See https://docs.google.com/document/d/1rk04jEuGfk9kYzfqCuOlPTSJw3hEDZJTBN5E5f1SALo/edit
 *
 * Installation:
 * >> cd <repo>
 * >> Windows
 * >> fsutil hardlink create .\.git\hooks\commit-msg .\tasks\lib\validate-commit-msg.js
 * >> Non-Windows
 * >> ln -s .tasks/lib/validate-commit-msg.js .git/hooks/commit-msg
 */
var fs = require('fs');
var util = require('util');
var path = require('path');


var MAX_FIRST_LINE_LENGTH = 50;
var ALLOW_EMPTY_SECOND_LINE = false;
var MAX_LENGTH = 70;
var PATTERN = /^(\w*)(\(([\w\$\.\-\*]*)\))?\: (.*)$/;
var IGNORED = /^(WIP\:|Merge pull request|http(s)?\:\/\/)/;
var TYPES = {
  feat: true,
  fix: true,
  docs: true,
  style: true,
  refactor: true,
  test: true,
  chore: true
};

var TYPE_NAMES = [];
for (var typeName in TYPES) {
  if (TYPES.hasOwnProperty(typeName)) {
      TYPE_NAMES.push(typeName);
  }
}

var error = function() {
  // gitx does not display it
  // https://groups.google.com/group/gitx/browse_thread/thread/a03bcab60844b812
  console.error('INVALID COMMIT MSG: ' + util.format.apply(null, arguments));
};

var validateLength = function(message, length, index) {
  if (message.length > length) {
      error('line %d is longer than %d characters !', index + 1, length);
      return false;
  }
  return true;
};

var validateMessage = function(message, index) {
  var isValid = true;
  var firstLine = index === 0,
    secondLine = index === 1;

  if (IGNORED.test(message)) {
    console.log('Commit message validation ignored.');
    return true;
  }

  if (secondLine && !ALLOW_EMPTY_SECOND_LINE && (message.length > 0)) {
    error('second line must be empty!');
    return false;
  }

  var maxLength = firstLine ? MAX_FIRST_LINE_LENGTH : MAX_LENGTH;
  isValid = validateLength(message, maxLength, index);
  if (index > 0) {
    return isValid;
  }

  var validTypes = 'valid <type> values are: ' + TYPE_NAMES.join(', ');

  var match = PATTERN.exec(message);

  if (!match) {
    error('does not match "<type>(<scope>): <subject>" !\n' + validTypes);
    return false;
  }

  var type = match[1];

  if (!TYPES.hasOwnProperty(type)) {
    error('"%s" is not allowed type !\n' + validTypes, type);
    return false;
  }

  // Some more ideas, do want anything like this ?
  // - allow only specific scopes (eg. fix(docs) should not be allowed ?
  // - auto correct the type to lower case ?
  // - auto correct first letter of the subject to lower case ?
  // - auto add empty line after subject ?
  // - auto remove empty () ?
  // - auto correct typos in type ?
  // - store incorrect messages, so that we can learn

  return isValid;
};

var linesFromBuffer = function(buffer) {
  return buffer.toString()
    .split('\n');
};

// publish for testing
exports.validateMessage = validateMessage;

// lame test if run by git (so that it does not trigger during testing)
if (process.env.GIT_DIR) {
  var commitMsgFile = process.argv[2];
  var incorrectLogFile = path.dirname(commitMsgFile) + '/logs/incorrect-commit-msgs';

  fs.readFile(commitMsgFile, function(err, buffer) {
    var msg = linesFromBuffer(buffer);

    var errorMsg = '';
    for (var i = 0; i < msg.length; ++i) {
      if (!validateMessage(msg[i], i)) {
        errorMsg += (msg + '\n');
      }
    }

    if (errorMsg !== '') {
      fs.appendFile(incorrectLogFile, errorMsg, function() {
        process.exit(1);
      });
    } else {
      process.exit(0);
    }
  });
}
