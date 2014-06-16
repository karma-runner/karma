#!/usr/bin/env node
'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');

// We have a copy of rimraf (v2.2.2), so that people can run this script without `npm install`.
var rimraf = require('./rimraf');

var isWin = !!process.platform.match(/^win/);

var pathTo = function(p) {
  return path.resolve(__dirname + '/../' + p);
};

var scriptPath = pathTo('node_modules/grunt-conventional-changelog/lib/validate-commit-msg.js');
var gitHookPath = pathTo('.git/hooks/commit-msg');

var gitHookSetup = function() {

  if (fs.existsSync(gitHookPath)) {
    fs.unlinkSync(gitHookPath);
    console.log('Existing link removed:', gitHookPath);
  }

  console.log('Adding symbolic link: %s linked to %s', scriptPath, gitHookPath);
  try {
    // "hooks" may not exist
    fs.mkdirSync(path.dirname(gitHookPath));
  } catch (e) {}
  fs.symlinkSync(scriptPath, gitHookPath, 'file');
};

var installGruntCli = function(callback) {

  console.log('Installing grunt-cli...');

  var gcli = exec('npm install -g grunt-cli', function(error) {

    if (error !== null) {
      console.error('error installing grunt-cli: ' + error);
    } else {
      callback();
    }

  });

  gcli.stdout.pipe(process.stdout);
  gcli.stderr.pipe(process.stderr);

};

var checkForGruntCli = function(callback) {

  console.log('Checking for grunt-cli...');

  exec('grunt --version', function(error, stdout) {

    if (error) {
      installGruntCli(callback);
    } else {
      console.log('grunt-cli is already installed:');
      console.log(stdout);
      callback();
    }

  });
};

var installDependencies = function() {

  console.log('Installing dependencies...');

  var install = exec('npm install', function(error) {

    if (error !== null) {
      console.error('Error installing karma dependencies: ' + error);
    }

    // Remove the extra karma in node_modules/karma.
    // This is Karma from NPM, installed because plugins have Karma as a peer dependency and
    // at the same time, Karma uses a local instance if present and therefore running `karma`
    // in the working directory would cause using the Karma from NPM, rather than the Karma from
    // the working space.
    rimraf(pathTo('node_modules/karma'), function(err) {
      if (err) {
        console.error('Can not remove "' + pathTo('node_modules/karma') + '".\n' +
                      'Please remove it manually.');
      } else {
        console.log('YAY, YOUR WORKSPACE IS READY!');
      }
    });
  });

  install.stdout.pipe(process.stdout);
  install.stderr.pipe(process.stderr);

};

var runInit = function() {

  gitHookSetup();
  checkForGruntCli(function cb() {
    installDependencies();
  });

};

if (isWin) {

  exec('whoami /priv', function(err, o) {
    if (err || o.indexOf('SeCreateSymbolicLinkPrivilege') === -1) {
      console.log('You do not appear to have symlink privileges. Exiting init script.');
      console.log('Windows requires admin privileges to create symlinks.');
    } else {
      runInit();
    }
  });

} else {
  runInit();
}
