#!/usr/bin/env node
'use strict';

var fs = require('fs');
var exec = require('child_process').exec;

var isWin = !!process.platform.match(/^win/);

var validateCommitPath = '../../tasks/lib/validate-commit-msg.js';
var gitHookPath = '.git/hooks/commit-msg';

var nodeModulesPath = 'node_modules';
var karmaPath = '..';
var nmKarmaPath = 'node_modules/karma';

//Add Hook "validate-commit-msg"
var gitHookSetup = function(){
  if (fs.existsSync(gitHookPath)) {
    fs.unlinkSync(gitHookPath);
    console.log('Existing link removed:', gitHookPath);
  }

  console.log('Adding symbolic link: %s linked to %s', validateCommitPath, gitHookPath);
  fs.symlinkSync(validateCommitPath, gitHookPath, 'file');
};

var selfLinkSetup = function() {
  if (!fs.existsSync(nodeModulesPath)) {
    fs.mkdirSync(nodeModulesPath);
  }

  if (fs.existsSync(nmKarmaPath)) {
    fs.unlinkSync(nmKarmaPath);
    console.log('Existing link removed:', nmKarmaPath);
  }

  console.log('Adding symbolic link: %s linked to %s', karmaPath, nmKarmaPath);
  fs.symlinkSync(karmaPath, nmKarmaPath, 'dir');
};

// Check for gurnt-cli
var installGruntCli = function(callback) {

  console.log('Installing grunt-cli...');

  var gcli = exec('npm install -g grunt-cli', function (error) {

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

  exec('grunt --version', function (error, stdout) {

    if ( error ) {
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

  var install = exec('npm install', function (error) {

    if (error !== null) {
      console.error('Error installing karma dependencies: ' + error);
    }

  });

  install.stdout.pipe(process.stdout);
  install.stderr.pipe(process.stderr);

};

var runInit = function() {

  gitHookSetup();
  selfLinkSetup();
  checkForGruntCli(function cb() {
    installDependencies();
  });

};

if ( isWin ){

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