In order to serve you well, Karma needs to know about your project in order to test it
and this is done via a configuration file. This page explains how to create such a configuration file.

See [configuration file docs] for more information about the syntax and all the available options.

## Generating the config file

The configuration file can be generated using `karma init`:
```bash
$ karma init my.conf.js

Which testing framework do you want to use?
Press tab to list possible options. Enter to move to the next question.
> jasmine

Do you want to use Require.js?
This will add Require.js plugin.
Press tab to list possible options. Enter to move to the next question.
> no

Do you want to capture a browser automatically?
Press tab to list possible options. Enter empty string to move to the next question.
> Chrome
> Firefox
>

What is the location of your source and test files?
You can use glob patterns, eg. "js/*.js" or "test/**/*Spec.js".
Press Enter to move to the next question.
> *.js
> test/**/*.js
>

Should any of the files included by the previous patterns be excluded?
You can use glob patterns, eg. "**/*.swp".
Press Enter to move to the next question.
>

Do you want Karma to watch all the files and run the tests on change?
Press tab to list possible options.
> yes

Config file generated at "/Users/vojta/Code/karma/my.conf.js".
```

The configuration file can be written in CoffeeScript as well.
In fact, if you execute `karma init` with a `*.coffee` extension such as `karma init karma.conf.coffee`, it will generate a CoffeeScript file.

Of course, you can write the config file by hand or copy-paste it from another project ;-)

## Starting Karma
When starting Karma, the configuration file path can be passed in as the first argument.

By default, Karma will look for `karma.conf.js` or `karma.conf.coffee` in the current directory.
```bash
# Start Karma using your configuration:
$ karma start my.conf.js
```

For more detailed information about the Karma configuration file, such as available options and features,
please read the [configuration file docs].

## Command line arguments
Some configurations, which are already present within the configuration file, can be overridden by specifying the configuration
as a command line argument for when Karma is executed.

```bash
karma start my.conf.js --log-level debug --single-run
```

Try `karma start --help` if you want to see all available options.


## Integrating with Grunt/Gulp
- [grunt-karma]
- [gulp-karma]


[configuration file docs]: ../config/configuration-file.html
[Grunt]: http://gruntjs.com/
[grunt-karma]: https://github.com/karma-runner/grunt-karma
[Gulp]: http://gulpjs.com
[gulp-karma]: https://github.com/karma-runner/gulp-karma
