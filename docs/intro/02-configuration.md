In order to serve you well, Testacular needs to know about your
project. That's done through a configuration file.

For an example file, see [test/client/testacular.conf.js]
which contains most of the options.

## Generating the config file
You can write the config file by hand or copy paste it from another project.

A third way is to use `testacular init` to generate it.
```bash
# This will ask you a few questions and generate a new config file
# called my.conf.js
$ testacular init my.conf.js
```

## Starting Testacular
When starting testacular, you can pass a path to the configuration file as an argument.

By default, Testacular will look for `testacular.conf.js` in the current directory.
```bash
# Start Testacular using your configuration
$ testacular start my.conf.js
```
For more info about configuration file, see the [configuration file docs].

## Command line arguments
Some of the configurations can be specified as a command line argument, which
overrides the configuration from the config file.

Try `testacular start --help` if you want to see all available options.


[test/client/testacular.conf.js]: https://github.com/testacular/testacular/blob/master/test/client/testacular.conf.js
[configuration file docs]: configuration_file.html
