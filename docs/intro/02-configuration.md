In order to serve you well, Karma needs to know about your
project. That's done through a configuration file.

For an example file, see [test/client/karma.conf.js]
which contains most of the options.

## Generating the config file
You can write the config file by hand or copy paste it from another project.

A third way is to use `karma init` to generate it.
```bash
# This will ask you a few questions and generate a new config file
# called my.conf.js
$ karma init my.conf.js
```

## Starting Karma
When starting Karma, you can pass a path to the configuration file as an argument.

By default, Karma will look for `karma.conf.js` in the current directory.
```bash
# Start Karma using your configuration
$ karma start my.conf.js
```
For more info about configuration file, see the [configuration file docs].

## Command line arguments
Some of the configurations can be specified as a command line argument, which
overrides the configuration from the config file.

Try `karma start --help` if you want to see all available options.


[test/client/karma.conf.js]: https://github.com/karma-runner/karma/blob/master/test/client/karma.conf.js
[configuration file docs]: configuration_file.html
