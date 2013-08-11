In order to serve you well, Karma needs to know about your project in order to test it
and this is done via a configuration file. This page explains how to create such a configuration file.

See [configuration file docs] for more information about the syntax and the available options.

## Generating the config file

The configuration file can be generated using `karma init`:
```bash
$ karma init my.conf.js

Which testing framework do you want to use ?
Press tab to list possible options. Enter to move to the next question.
> jasmine

Do you want to use Require.js ?
This will add Require.js plugin.
Press tab to list possible options. Enter to move to the next question.
> no

Do you want to capture a browser automatically ?
Press tab to list possible options. Enter empty string to move to the next question.
> Chrome
> Firefox
>

What is the location of your source and test files ?
You can use glob patterns, eg. "js/*.js" or "test/**/*Spec.js".
Enter empty string to move to the next question.
> *.js
> test/**/*.js
>

Should any of the files included by the previous patterns be excluded ?
You can use glob patterns, eg. "**/*.swp".
Enter empty string to move to the next question.
>

Do you want Karma to watch all the files and run the tests on change ?
Press tab to list possible options.
> yes

Config file generated at "/Users/vojta/Code/karma/my.conf.js".
```

The configuration file can be written in CoffeeScript as well.
In fact, if you execute `karma init` with a `.coffee` filename extension, it will generate a CoffeeScript file.

Of course, you can write the config file by hand or copy paste it from another project ;-)

## Starting Karma
When starting Karma, the configuration file path can be passed in as the first argument.

By default, Karma will look for `karma.conf.js` in the current directory.
```bash
# Start Karma using your configuration
$ karma start my.conf.js
```

For more detailed information about the Karma configuration file, such as available options and features,
please read the [configuration file docs].

## Command line arguments
Some configurations, which are already present within the configuration file, can be overridden by specifying the configuration
as a command line argument for when Karma is executed.

```bash
karma start karma-conf.js --command-one --command-two
```

Try `karma start --help` if you want to see all available options.


## Using Grunt
If you are using <a href="http://gruntjs.com/">Grunt</a> within your project,
the [grunt-karma] plugin may be useful.
The `grunt-karma` plugin allows you to place your Karma configurations directly within your `Gruntfile`.
By doing so, the central `karma.conf.js` is no longer required. However, this also means that Karma must also be run as a Grunt task.
Please visit the [Grunt Karma Github Page](https://github.com/karma-runner/grunt-karma#running-tests) to learn more about how it's used.


[configuration file docs]: ../config/configuration-file.html
[Grunt]: http://gruntjs.com/
[grunt-karma]: https://github.com/karma-runner/grunt-karma
[grunt-karma-usage] https://github.com/karma-runner/grunt-karma#running-tests
