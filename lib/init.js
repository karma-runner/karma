var readline = require('readline');
var fs = require('fs');
var util = require('util');
var path = require('path');
var glob = require('glob');

var helper = require('./helper');
var launcher = require('./launcher');
var logger = require('./logger');
var constant = require('./constants');

var log = logger.create('init');

var CONFIG_TPL_PATH = __dirname + '/../config.template';


var COLORS_ON = {
  END: '\x1B[39m',
  NYAN: '\x1B[36m',
  GREEN: '\x1B[32m',
  BOLD: '\x1B[1m',
  bold: function(str) {
    return this.BOLD + str + '\x1B[22m';
  },
  green: function(str) {
    return this.GREEN + str + this.END;
  }
};

// nasty global
var colors = COLORS_ON;

var COLORS_OFF = {
  END: '',
  NYAN: '',
  GREEN: '',
  BOLD: '',
  bold: function(str) {
    return str;
  },
  green: function(str) {
    return str;
  }
};

var validatePattern = function(value) {
  if (!glob.sync(value).length) {
    log.warn('There is no file matching this pattern.\n' + colors.NYAN);
  }
};


var validateBrowser = function(value) {
  var proto = launcher[value + 'Browser'].prototype;
  var defaultCmd = proto.DEFAULT_CMD[process.platform];
  var envCmd = process.env[proto.ENV_CMD];

  if (!fs.existsSync(defaultCmd) && (!envCmd || !fs.existsSync(envCmd))) {
    log.warn('No binary for ' + value + '.' + '\n  Create symlink at "' + defaultCmd + '", or set "' + proto.ENV_CMD + '" env variable.\n' + colors.NYAN);
  }
};


var questions = [{
  id: 'framework',
  question: 'Which testing framework do you want to use ?',
  hint: 'Press tab to list possible options. Enter to move to the next question.',
  options: ['jasmine', 'mocha', 'qunit', '']
}, {
  id: 'requirejs',
  question: 'Do you want to use Require.js ?',
  hint: 'This will add Require.js adapter into files.\nPress tab to list possible options. Enter to move to the next question.',
  options: ['no', 'yes'],
  boolean: true
}, {
  id: 'browsers',
  question: 'Do you want to capture a browser automatically ?',
  hint: 'Press tab to list possible options. Enter empty string to move to the next question.',
  options: ['Chrome', 'ChromeCanary', 'Firefox', 'Safari', 'PhantomJS', 'Opera', 'IE', ''],
  validate: validateBrowser,
  multiple: true
}, {
  id: 'includedFiles',
  question: 'Which files do you want to include with <script> tag ?',
  hint: 'This should be a script that bootstraps your test by configuring Require.js and kicking __karma__.start()\nYou can use glob patterns, eg. "js/*.js" or "test/**/*Spec.js".\nEnter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern,
  condition: function(answers) {return answers.requirejs;}
}, {
  id: 'files',
  question: 'Which files do you want to test ?',
  hint: 'You can use glob patterns, eg. "js/*.js" or "test/**/*Spec.js".\nEnter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern
}, {
  id: 'exclude',
  question: 'Any files you want to exclude ?',
  hint: 'You can use glob patterns, eg. "**/*.swp".\nEnter empty string to move to the next question.',
  multiple: true,
  validate: validatePattern
}, {
  id: 'autoWatch',
  question: 'Do you want Karma to watch all the files and run the tests on change ?',
  hint: 'Press tab to list possible options.',
  options: ['yes', 'no'],
  boolean: true
}];



var StateMachine = function(rli) {
  var currentQuestion;
  var answers;
  var currentOptions;
  var currentOptionsPointer;
  var pendingQuestionId;
  var done;

  this.onKeypress = function(key) {
    if (!currentOptions || !key) {
      return;
    }

    if (key.name === 'tab' || key.name === 'right' || key.name === 'down') {
      this.suggestNextOption();
    } else if (key.name === 'left' || key.name === 'up') {
      currentOptionsPointer = currentOptionsPointer + currentOptions.length - 2;
      this.suggestNextOption();
    }

    if (!key.ctrl && !key.meta && key.name !== 'enter' && key.name !== 'return') {
      key.name = 'escape';
    }
  };

  this.suggestNextOption = function() {
    if (!currentOptions) {
      return;
    }

    currentOptionsPointer = (currentOptionsPointer + 1) % currentOptions.length;
    rli._deleteLineLeft();
    rli._deleteLineRight();
    rli.write(currentOptions[currentOptionsPointer]);
  };


  this.onLine = function(line) {
    if (pendingQuestionId) {
      if (currentOptions) {
        currentOptionsPointer = currentOptions.indexOf(line);
        if (currentOptionsPointer === -1) {
          return;
        }
      }

      if (line && currentQuestion.validate) {
        currentQuestion.validate(line);
      }

      if (currentQuestion.boolean) {
        line = (line === 'yes' || line === 'true' || line === 'on');
      }

      if (currentQuestion.multiple) {
        answers[pendingQuestionId] = answers[pendingQuestionId] || [];
        if (line) {
          answers[pendingQuestionId].push(line);
          rli.prompt();

          if (currentOptions) {
            currentOptions.splice(currentOptionsPointer, 1);
            currentOptionsPointer = -1;
          }
        } else {
          this.nextQuestion();
        }
      } else {
        answers[pendingQuestionId] = line;
        this.nextQuestion();
      }
    }
  };

  this.nextQuestion = function() {
    rli.write(colors.END);
    currentQuestion = questions.shift();

    while (currentQuestion && currentQuestion.condition && !currentQuestion.condition(answers)) {
      currentQuestion = questions.shift();
    }

    if (currentQuestion) {
      pendingQuestionId = null;

      rli.write('\n' + colors.bold(currentQuestion.question) + '\n');
      rli.write(currentQuestion.hint + colors.NYAN + '\n');

      currentOptions = currentQuestion.options || null;
      currentOptionsPointer = -1;
      pendingQuestionId = currentQuestion.id;
      rli.prompt();

      this.suggestNextOption();
    } else {
      pendingQuestionId = null;
      currentOptions = null;

      // end
      done(answers);
    }
  };

  this.process = function(_questions, _done) {
    questions = _questions;
    answers = {};
    done = _done;

    this.nextQuestion();
  };
};


var quote = function(value) {
  return '\'' + value + '\'';
};

var quoteNonIncludedPattern = function(value) {
  return util.format('{pattern: %s, included: false}', quote(value));
};


var formatFiles = function(files) {
  return files.join(',\n  ');
};


var getBasePath = function(configFilePath, cwd) {
  var configParts = path.dirname(configFilePath).split(path.sep);
  var cwdParts = cwd.split(path.sep);
  var base = [];

  while (configParts.length && configParts[0] === cwdParts[0]) {
    configParts.shift();
    cwdParts.shift();
  }

  while (configParts.length) {
    var part = configParts.shift();
    if (part === '..') {
      base.unshift(cwdParts.pop());
    } else if (part !== '.') {
      base.unshift('..');
    }
  }

  return base.join(path.sep);
};


var getReplacementsFromAnswers = function(answers, basePath) {
  var files = answers.files.map(answers.includedFiles ? quoteNonIncludedPattern : quote);

  if (answers.includedFiles) {
    files = answers.includedFiles.map(quote).concat(files);
  }

  if (answers.requirejs) {
    files.unshift('REQUIRE_ADAPTER');
    files.unshift('REQUIRE');
  }

  if (answers.framework) {
    var framework = answers.framework.toUpperCase();
    files.unshift(framework + '_ADAPTER');
    files.unshift(framework);
  }

  return {
    DATE: new Date(),
    BASE_PATH: basePath,
    FILES: formatFiles(files),
    EXCLUDE: answers.exclude ? formatFiles(answers.exclude.map(quote)) : '',
    AUTO_WATCH: answers.autoWatch ? 'true' : 'false',
    BROWSERS: answers.browsers.map(quote).join(', ')
  };
};


exports.init = function(config) {
  var useColors = true;
  var logLevel = constant.LOG_INFO;

  if (helper.isDefined(config.colors)) {
    colors = config.colors ? COLORS_ON : COLORS_OFF;
    useColors = config.colors;
  }

  if (helper.isDefined(config.logLevel)) {
    logLevel = config.logLevel;
  }

  logger.setup(logLevel, useColors);


  // need to be registered before creating readlineInterface
  process.stdin.on('keypress', function(s, key) {
    sm.onKeypress(key);
  });

  var rli = readline.createInterface(process.stdin, process.stdout);
  var sm = new StateMachine(rli, colors);

  rli.on('line', sm.onLine.bind(sm));

  sm.process(questions, function(answers) {
    var cwd = process.cwd();
    var configFile = config.configFile;
    var replacements = getReplacementsFromAnswers(answers, getBasePath(configFile, process.cwd()));
    var content = fs.readFileSync(CONFIG_TPL_PATH).toString().replace(/%(.*)%/g, function(a, key) {
      return replacements[key];
    });

    var configFilePath = path.resolve(cwd, configFile);
    fs.writeFileSync(configFilePath, content);
    rli.write(colors.green('\nConfig file generated at "' + configFilePath + '".\n\n'));
    rli.close();
  });
};
